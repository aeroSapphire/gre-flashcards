import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function bulkGenerate() {
    console.log('🚀 Starting bulk example generation...');

    // 1. Fetch cards missing examples
    const { data: cards, error } = await supabase
        .from('flashcards')
        .select('id, word, definition')
        .or('example.is.null,example.eq.""');

    if (error) {
        console.error('Error fetching cards:', error);
        return;
    }

    if (!cards || cards.length === 0) {
        console.log('✅ No cards missing examples found.');
        return;
    }

    console.log(`Found ${cards.length} cards missing examples. Beginning generation...`);

    let successCount = 0;
    let failCount = 0;

    for (const card of cards) {
        console.log(`Processing: "${card.word}"...`);

        try {
            // 2. Call Edge Function
            const { data, error: invokeError } = await supabase.functions.invoke('evaluate-sentence', {
                body: {
                    word: card.word,
                    definition: card.definition,
                    mode: 'generate'
                }
            });

            if (invokeError) {
                console.error(`  ❌ Error calling AI for "${card.word}":`, invokeError);
                failCount++;
                continue;
            }

            let examples = [];
            if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed.examples)) {
                        examples = parsed.examples;
                    } else if (typeof parsed.example === 'string') {
                        examples = [parsed.example];
                    }
                } catch (e) {
                    console.error(`  ❌ Failed to parse response for "${card.word}"`);
                }
            } else {
                if (Array.isArray(data?.examples)) {
                    examples = data.examples;
                } else if (typeof data?.example === 'string') {
                    examples = [data.example];
                } else if (typeof data?.examples === 'string') {
                    examples = [data.examples];
                }
            }

            if (examples && examples.length > 0) {
                const primaryExample = examples[0];

                // 3. Update the card
                const { error: updateError } = await supabase
                    .from('flashcards')
                    .update({ example: primaryExample })
                    .eq('id', card.id);

                if (updateError) {
                    console.error(`  ❌ Error updating database for "${card.word}":`, updateError);
                    failCount++;
                } else {
                    console.log(`  ✅ Saved: "${primaryExample}"`);
                    successCount++;
                }
            } else {
                console.warn(`  ⚠️ No examples returned for "${card.word}". Raw data:`, data);
                failCount++;
            }

            // Add a small delay to avoid overwhelming the Edge Function / Rate Limits
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (err) {
            console.error(`  ❌ Unexpected error for "${card.word}":`, err);
            failCount++;
        }
    }

    console.log('\n--- 📊 Bulk Generation Summary ---');
    console.log(`Total Cards Found: ${cards.length}`);
    console.log(`Successfully Updated: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('-----------------------------------');
}

bulkGenerate().catch(err => {
    console.error('Fatal error in bulk script:', err);
});
