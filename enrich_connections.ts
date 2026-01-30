import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.resolve('.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim().replace(/"/g, '');
});

const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function enrichConnections() {
    console.log('Fetching all cards...');

    const { data: allCards, error } = await supabase
        .from('flashcards')
        .select('id, word, definition, synonyms, antonyms');

    if (error) {
        console.error('Error fetching cards:', error);
        return;
    }

    if (!allCards || allCards.length === 0) {
        console.log('No cards found.');
        return;
    }

    // Prepare a simplified vocabulary list (just words) to send to LLM
    // We remove definitions to save tokens (limit is 6000 TPM)
    const vocabList = allCards.map(c => c.word);

    // Filter cards that need connections (e.g., empty arrays)
    // For now, let's just try to process a batch of cards that haven't been processed
    // or just process "voracious" and a few others for testing
    const cardsToProcess = allCards.filter(c => 
        (!c.synonyms || c.synonyms.length === 0) && 
        (!c.antonyms || c.antonyms.length === 0)
    );

    console.log(`Found ${cardsToProcess.length} cards needing connections.`);
    
    // Let's process a larger batch now that we have rate limiting
    // We'll process up to 50 cards at a time
    const voracious = cardsToProcess.find(c => c.word.toLowerCase() === 'voracious');
    const batch = voracious ? [voracious] : [];
    
    // Add more cards
    for (const card of cardsToProcess) {
        if (batch.length >= 700) break;
        if (card.id !== voracious?.id) batch.push(card);
    }

    console.log(`Processing batch of ${batch.length} cards...`);

    for (const card of batch) {
        console.log(`Processing connections for: ${card.word}...`);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('evaluate-sentence', {
                body: {
                    word: card.word,
                    definition: card.definition,
                    vocabulary_list: vocabList, // Pass full list context
                    mode: 'word-connections'
                }
            });

            if (functionError) throw functionError;

            if (data && data.error) {
                console.error('API Error Details:', data);
                throw new Error(JSON.stringify(data.error));
            }

            let result = { synonyms: [], antonyms: [], related_roots: [] };
            if (typeof data === 'string') {
                try {
                    result = JSON.parse(data);
                } catch (e) {
                    console.log('  Failed to parse response:', data);
                    continue;
                }
            } else {
                result = data;
            }

            console.log(`  Found: ${result.synonyms?.length || 0} synonyms, ${result.antonyms?.length || 0} antonyms`);

            // Update the card
            const { error: updateError } = await supabase
                .from('flashcards')
                .update({
                    synonyms: result.synonyms || [],
                    antonyms: result.antonyms || [],
                    related_roots: result.related_roots || []
                })
                .eq('id', card.id);

            if (updateError) {
                console.error(`  Error updating card ${card.word}:`, updateError);
            } else {
                console.log(`  Updated ${card.word} successfully.`);
            }

            // Wait to respect rate limits (Groq limit is 6000 TPM, each req is ~2600 tokens)
            console.log('Waiting 30s to respect rate limits...');
            await new Promise(resolve => setTimeout(resolve, 30000));

        } catch (err) {
            console.error(`  Error processing ${card.word}:`, err);
            // Even on error, wait a bit before next retry
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
}

enrichConnections();
