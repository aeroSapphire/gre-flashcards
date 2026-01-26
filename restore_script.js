import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually parse .env
const envPath = path.resolve('.env');
let env = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function restore() {
    try {
        const backupPath = path.resolve('cards_backup.json');
        if (!fs.existsSync(backupPath)) {
            throw new Error('cards_backup.json not found');
        }

        const rawData = fs.readFileSync(backupPath, 'utf8');
        const cards = JSON.parse(rawData);

        if (!Array.isArray(cards)) {
            throw new Error('Invalid JSON format: Expected an array');
        }

        console.log(`Found ${cards.length} cards in backup.`);

        const formattedCards = cards.map((card) => ({
            word: card.word,
            definition: card.definition,
            example: card.example,
            status: card.status || 'new',
            created_at: new Date(card.createdAt || Date.now()).toISOString(),
            updated_at: new Date().toISOString(),
            tags: card.listId ? [`list:${card.listId}`] : [],
        }));

        // Insert in chunks
        const chunkSize = 10;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < formattedCards.length; i += chunkSize) {
            const chunk = formattedCards.slice(i, i + chunkSize);
            const { error } = await supabase.from('flashcards').insert(chunk);

            if (error) {
                console.error('Error inserting chunk:', error);
                errorCount += chunk.length;
            } else {
                successCount += chunk.length;
                process.stdout.write('.');
            }
        }

        console.log(`\nRestoration complete: ${successCount} inserted, ${errorCount} failed.`);

    } catch (err) {
        console.error('Restoration failed:', err);
        process.exit(1);
    }
}

restore();
