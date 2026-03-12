/**
 * Patches gre_question_bank.json to add _____ blank markers
 * to SE and TC questions that were missing them, then re-upserts
 * the affected questions into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=yyy npx tsx scripts/patch_question_blanks.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Text patches ──────────────────────────────────────────────────────────────
// Each entry: [find, replace] — applied as a simple string replacement on question_text.
// Must be specific enough to match exactly one question.

const TEXT_PATCHES: [string, string][] = [
    // ── Sentence Equivalence: 11 questions with missing blank ──────────────────

    // Q2: blank between "is" and "market"
    ['because it is market,', 'because it is _____ market,'],

    // Q3: blank between "seemingly" and "topic"
    ['a seemingly topic,', 'a seemingly _____ topic,'],

    // Q4: blank between "which" and "its"
    ['some of which its aesthetics,', 'some of which _____ its aesthetics,'],

    // Q5: blank between "people" and "the"
    ['That people the musical features', 'That people _____ the musical features'],

    // Q6: blank between "dominated" and "professions"
    ['and dominated professions like', 'and dominated _____ professions like'],

    // Q7: blank between "particularly" and "when"
    ['is particularly when the name', 'is particularly _____ when the name'],

    // Q8: blank between "two" and "theories"
    ['when two theories emerged', 'when two _____ theories emerged'],

    // Q13: blank between "is" and "the candidate"
    ['the entire party is the candidate with', 'the entire party is _____ the candidate with'],

    // Q18: blank after "Roth's" (possessive + blank + "that")
    ["to Roth's that he", "to Roth's _____ that he"],

    // Q22: blank between "is" and "businesswoman"
    ['Fressange is businesswoman who', 'Fressange is _____ businesswoman who'],

    // Q23: blank between "markedly" and "courses"
    ['followed markedly courses;', 'followed markedly _____ courses;'],

    // ── Text Completion: single-blank questions with missing blank ─────────────

    // "the public was [unaware of] the propagandistic influence"
    ['the public was the propagandistic influence', 'the public was _____ the propagandistic influence'],

    // "seems to defy rather than to [woo] the audience"
    ['rather than to the audience', 'rather than to _____ the audience'],

    // "the secretary stood by his [sanguine] long-term outlook"
    ['stood by his long-term outlook', 'stood by his _____ long-term outlook'],

    // "viewed as the [panacea] for poverty"
    ['viewed as the for poverty', 'viewed as the _____ for poverty'],

    // "science at the university was in [a pathetic] state"
    ['was in state, despite', 'was in _____ state, despite'],

    // "the capacity to [dissemble] is not uniquely human"
    ['the capacity to is not uniquely human', 'the capacity to _____ is not uniquely human'],

    // "she was hardly the [impecunious] student"
    ['she was hardly the student she later', 'she was hardly the _____ student she later'],
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const jsonPath = path.join(process.cwd(), 'gre_question_bank.json');
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    const questions: Array<{ id: string; question_text: string; [k: string]: unknown }> = data.questions;

    const patched: Array<{ id: string; question_text: string }> = [];

    for (const [find, replace] of TEXT_PATCHES) {
        const q = questions.find(q => q.question_text.includes(find));
        if (!q) {
            console.warn(`⚠  No match found for: "${find.substring(0, 50)}..."`);
            continue;
        }
        if (q.question_text.includes('_____')) {
            // Already has a blank somewhere — skip to avoid double-patching
            console.log(`✓  Already patched: ${q.question_text.substring(0, 60)}...`);
            continue;
        }
        q.question_text = q.question_text.replace(find, replace);
        patched.push({ id: q.id, question_text: q.question_text });
        console.log(`✓  Patched: "${replace.substring(0, 70)}..."`);
    }

    if (patched.length === 0) {
        console.log('\nAll questions already patched. Nothing to update.');
        return;
    }

    // Write patched JSON back
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`\nWrote ${patched.length} patches to gre_question_bank.json`);

    // Upsert only the patched questions into Supabase
    for (const p of patched) {
        const { error } = await supabase
            .from('gre_bank_questions')
            .update({ question_text: p.question_text })
            .eq('id', p.id);
        if (error) {
            console.error(`  ✗ Failed to update ${p.id}:`, error.message);
        } else {
            console.log(`  ↑ Updated in Supabase: ${p.id}`);
        }
    }

    console.log('\nDone! Re-run to verify no warnings remain.');
}

main().catch(err => { console.error(err); process.exit(1); });
