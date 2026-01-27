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

// OLD Lovable database (source) - read-only with anon key
const oldSupabase = createClient(
    'https://zboapofvqnpccbibhjlt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpib2Fwb2Z2cW5wY2NiaWJoamx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDYwNDQsImV4cCI6MjA4NDk4MjA0NH0.FNc0lwC7pFGja6_lQPhenTTvdbC5SF1MN0UE86z0s90'
);

// NEW database (destination) - using service role key
const newSupabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function migrateFlashcards() {
    console.log('Starting flashcard migration...\n');

    // Step 1: Fetch all flashcards from old database
    console.log('Fetching flashcards from old database...');
    const { data: oldCards, error: fetchError } = await oldSupabase
        .from('flashcards')
        .select('word, definition, example, tags')
        .order('created_at', { ascending: true });

    if (fetchError) {
        console.error('Error fetching from old database:', fetchError.message);
        return;
    }

    console.log(`Found ${oldCards?.length || 0} flashcards in old database.\n`);

    if (!oldCards || oldCards.length === 0) {
        console.log('No flashcards to migrate.');
        return;
    }

    // Step 2: Check what already exists in new database
    console.log('Checking existing flashcards in new database...');
    const { data: existingCards } = await newSupabase
        .from('flashcards')
        .select('word');

    const existingWords = new Set(existingCards?.map(c => c.word.toLowerCase()) || []);
    console.log(`Found ${existingWords.size} existing flashcards in new database.\n`);

    // Step 3: Filter to only new cards
    const newCards = oldCards.filter(card => !existingWords.has(card.word.toLowerCase()));
    console.log(`${newCards.length} new flashcards to migrate.\n`);

    if (newCards.length === 0) {
        console.log('All flashcards already exist in new database. Nothing to migrate.');
        return;
    }

    // Step 4: Insert new cards in batches
    const batchSize = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < newCards.length; i += batchSize) {
        const batch = newCards.slice(i, i + batchSize);

        const { error: insertError } = await newSupabase
            .from('flashcards')
            .insert(batch.map(card => ({
                word: card.word,
                definition: card.definition,
                example: card.example || null,
                tags: card.tags || ['GRE']
            })));

        if (insertError) {
            console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError.message);
            errors += batch.length;
        } else {
            inserted += batch.length;
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} cards`);
        }
    }

    console.log('\n========================================');
    console.log('Migration complete!');
    console.log(`Successfully inserted: ${inserted} flashcards`);
    if (errors > 0) console.log(`Failed: ${errors} flashcards`);
    console.log('========================================');
}

migrateFlashcards().catch(console.error);
