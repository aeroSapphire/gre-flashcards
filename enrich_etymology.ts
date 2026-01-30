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

async function enrichEtymology() {
    console.log('Fetching all cards...');

    // Fetch all cards with their etymology
    const { data: allCards, error } = await supabase
        .from('flashcards')
        .select('id, word, definition, etymology');

    if (error) {
        console.error('Error fetching cards:', error);
        return;
    }

    if (!allCards || allCards.length === 0) {
        console.log('No cards found.');
        return;
    }

    // Find cards that need enrichment:
    // 1. No etymology (null or empty string)
    // 2. Old short format (doesn't start with "derives from")
    const cardsToEnrich = allCards.filter(card => {
        if (!card.etymology || card.etymology.trim() === '') {
            return true; // Missing etymology
        }
        // Check if it's the old short format (doesn't start with "derives from")
        const lowercaseEtymology = card.etymology.toLowerCase().trim();
        return !lowercaseEtymology.startsWith('derives from');
    });

    if (cardsToEnrich.length === 0) {
        console.log('All cards already have detailed etymology.');
        return;
    }

    const missingCount = cardsToEnrich.filter(c => !c.etymology || c.etymology.trim() === '').length;
    const shortFormatCount = cardsToEnrich.length - missingCount;

    console.log(`Found ${cardsToEnrich.length} cards to enrich:`);
    console.log(`  - ${missingCount} cards missing etymology`);
    console.log(`  - ${shortFormatCount} cards with old short format`);

    for (let i = 0; i < cardsToEnrich.length; i++) {
        const card = cardsToEnrich[i];
        const hasOldFormat = card.etymology && card.etymology.trim() !== '';
        console.log(`[${i + 1}/${cardsToEnrich.length}] ${hasOldFormat ? 'Upgrading' : 'Adding'}: ${card.word}...`);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('evaluate-sentence', {
                body: {
                    word: card.word,
                    definition: card.definition,
                    mode: 'etymology'
                }
            });

            if (functionError) throw functionError;

            // Handle API failure from within the function
            if (data && data.error) {
                throw new Error(JSON.stringify(data.error));
            }

            let etymology = '';
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    etymology = parsed.etymology;
                } catch (e) {
                    console.log('  Failed to parse string response:', data);
                }
            } else if (data && data.etymology) {
                etymology = data.etymology;
            }

            if (etymology) {
                const { error: updateError } = await supabase
                    .from('flashcards')
                    .update({ etymology })
                    .eq('id', card.id);

                if (updateError) {
                    console.error(`  Error updating ${card.word}:`, updateError);
                } else {
                    console.log(`  Success: ${etymology.substring(0, 80)}...`);
                }
            } else {
                console.log(`  No etymology field in response for ${card.word}`);
            }

            // Stay well clear of rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (err: any) {
            console.error(`  Failed to enrich ${card.word}:`, err.message);
            if (err.message.includes('rate_limit') || err.message.includes('429')) {
                console.log('Rate limit reached. Waiting 15 seconds...');
                await new Promise(resolve => setTimeout(resolve, 15000));
                i--; // Retry this card
            }
        }
    }

    console.log('Enrichment complete!');
}

enrichEtymology().catch(console.error);
