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

// New database with service role key
const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

async function importFlashcards() {
    console.log('Starting flashcard import from CSV...\n');

    // Read CSV file
    const csvPath = path.resolve('flashcards.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('flashcards.csv not found!');
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Skip header
    const header = lines[0];
    console.log('CSV columns:', header);
    console.log(`Found ${lines.length - 1} rows in CSV.\n`);

    // Check existing cards
    console.log('Checking existing flashcards in database...');
    const { data: existingCards } = await supabase
        .from('flashcards')
        .select('word');

    const existingWords = new Set(existingCards?.map(c => c.word.toLowerCase()) || []);
    console.log(`Found ${existingWords.size} existing flashcards.\n`);

    // Parse and prepare cards
    const cardsToInsert: any[] = [];
    const skipped: string[] = [];

    for (let i = 1; i < lines.length; i++) {
        const fields = parseCSVLine(lines[i]);

        // Fields: id, word, definition, example, tags, status, created_at, updated_at, created_by
        const word = fields[1]?.trim();
        const definition = fields[2]?.trim();
        const example = fields[3]?.trim().replace(/^"""|"""$/g, '').replace(/""/g, '"') || null;

        // Parse tags - it's a JSON array string like ["GRE"]
        let tags: string[] = ['GRE'];
        try {
            const tagsStr = fields[4]?.trim();
            if (tagsStr && tagsStr !== '[]') {
                tags = JSON.parse(tagsStr.replace(/\\/g, ''));
            }
        } catch (e) {
            // Keep default tags
        }

        if (!word || !definition) {
            continue;
        }

        if (existingWords.has(word.toLowerCase())) {
            skipped.push(word);
            continue;
        }

        cardsToInsert.push({
            word,
            definition,
            example,
            tags: tags.length > 0 ? tags : ['GRE']
        });
    }

    console.log(`Cards to insert: ${cardsToInsert.length}`);
    console.log(`Skipped (already exist): ${skipped.length}\n`);

    if (cardsToInsert.length === 0) {
        console.log('No new cards to import.');
        return;
    }

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < cardsToInsert.length; i += batchSize) {
        const batch = cardsToInsert.slice(i, i + batchSize);

        const { error } = await supabase
            .from('flashcards')
            .insert(batch);

        if (error) {
            console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);

            // Try one by one for this batch
            for (const card of batch) {
                const { error: singleError } = await supabase
                    .from('flashcards')
                    .insert(card);

                if (singleError) {
                    console.error(`  Failed: ${card.word} - ${singleError.message}`);
                    errors++;
                } else {
                    inserted++;
                }
            }
        } else {
            inserted += batch.length;
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} cards`);
        }
    }

    console.log('\n========================================');
    console.log('Import complete!');
    console.log(`Successfully inserted: ${inserted} flashcards`);
    console.log(`Skipped (duplicates): ${skipped.length}`);
    if (errors > 0) console.log(`Failed: ${errors}`);
    console.log('========================================');
}

importFlashcards().catch(console.error);
