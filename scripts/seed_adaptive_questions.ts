/**
 * Seed script: Insert 200 GRE questions from gre_question_bank.json
 * into the Supabase `questions` table.
 *
 * Usage:
 *   npx tsx scripts/seed_adaptive_questions.ts
 *
 * Requires env vars:
 *   SUPABASE_URL  (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
    console.error('Set SUPABASE_SERVICE_KEY to your Supabase service role key (not the anon key).');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Question {
    id: string;
    section: string;
    question_type: string;
    difficulty: string;
    question_text: string;
    passage?: string | null;
    choices: Record<string, string>;
    correct_answer: string;
    explanation?: string | null;
    topic?: string | null;
    source?: string | null;
    created_at?: string;
}

async function seed() {
    const jsonPath = path.join(process.cwd(), 'gre_question_bank.json');

    if (!fs.existsSync(jsonPath)) {
        console.error(`File not found: ${jsonPath}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    const questions: Question[] = data.questions;

    console.log(`Loaded ${questions.length} questions from gre_question_bank.json`);

    const verbal = questions.filter(q => q.section === 'verbal').length;
    const quant = questions.filter(q => q.section === 'quant').length;
    console.log(`  Verbal: ${verbal}, Quant: ${quant}`);

    // Upsert in batches of 50
    const BATCH_SIZE = 50;
    let inserted = 0;

    for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = questions.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
            .from('gre_bank_questions')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
            process.exit(1);
        }

        inserted += batch.length;
        console.log(`  Inserted batch ${Math.ceil((i + 1) / BATCH_SIZE)} (${inserted}/${questions.length})`);
    }

    // Verify
    const { count, error: countError } = await supabase
        .from('gre_bank_questions')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error verifying count:', countError.message);
    } else {
        console.log(`\nVerification: ${count} questions now in the questions table.`);
    }

    console.log('Seeding complete!');
}

seed().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
