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

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function enrichment() {
    while (true) {
        console.log('\n--- Starting enrichment cycle ---');
        console.log('Fetching cards without part of speech...');
        const { data: cards, error } = await supabase
            .from('flashcards')
            .select('id, word, definition')
            .is('part_of_speech', null)
            .limit(100); // Process 100 at a time per cycle

        if (error) {
            console.error('Error fetching cards:', error);
            break;
        }

        if (!cards || cards.length === 0) {
            console.log('No cards left to enrich! All done.');
            break;
        }

        console.log(`Found ${cards.length} cards in this cycle (remaining to enrich: ?).\n`);

        let enrichedCount = 0;
        let failCount = 0;
        for (const card of cards) {
            try {
                const { data, error: invokeError } = await supabase.functions.invoke('evaluate-sentence', {
                    body: {
                        word: card.word,
                        definition: card.definition,
                        mode: 'enrich'
                    }
                });

                if (invokeError) {
                    console.error(`  Invoke Error for ${card.word}:`, invokeError);
                    failCount++;
                } else {
                    let posData = data;
                    if (typeof data === 'string') {
                        try {
                            posData = JSON.parse(data);
                        } catch (e) {
                            console.error(`  JSON Parse Error for ${card.word}:`, data);
                            failCount++;
                            continue;
                        }
                    }

                    if (posData && posData.part_of_speech) {
                        const { error: updateError } = await supabase
                            .from('flashcards')
                            .update({ part_of_speech: posData.part_of_speech.toLowerCase() })
                            .eq('id', card.id);

                        if (updateError) {
                            console.error(`  Update Error for ${card.word}:`, updateError.message);
                            failCount++;
                        } else {
                            enrichedCount++;
                            console.log(`  [OK] ${card.word} -> ${posData.part_of_speech}`);
                        }
                    } else {
                        console.error(`  Incomplete Data for ${card.word}:`, posData);
                        failCount++;
                    }
                }
            } catch (e) {
                console.error(`  Unexpected Error for ${card.word}:`, e);
                failCount++;
            }

            // Wait 2 seconds between each word to stay within rate limits
            await sleep(2000);
        }

        console.log(`\nCycle complete! Enriched: ${enrichedCount}, Failed: ${failCount}`);

        if (enrichedCount === 0 && failCount > 0) {
            console.log('No progress made in this cycle. Stopping to avoid infinite loop.');
            break;
        }

        console.log('Waiting 2 seconds before next cycle...');
        await sleep(2000);
    }
}

enrichment().catch(console.error);
