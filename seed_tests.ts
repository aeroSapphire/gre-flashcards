import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Helper to load env
const envPath = path.resolve('.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim().replace(/"/g, '');
});

// Use service role key for seeding (bypasses RLS)
const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

const CATEGORIES = [
    'No Shift Sentences',
    'Shift Sentences',
    'Double Blanks',
    'Triple Blanks',
    'Sentence Equivalence',
    'Reading Comprehension',
    'Weakening'
];

async function seed() {
    console.log('Starting seed...');

    for (const category of CATEGORIES) {
        // Create 2 tests per category
        for (let i = 1; i <= 2; i++) {
            const title = `${category} - Test ${i}`;
            console.log(`Creating test: ${title}`);

            const { data: test, error: testError } = await supabase
                .from('tests')
                .insert({
                    title,
                    category,
                    description: `Practice generic ${category} questions.`,
                    time_limit_minutes: 15
                })
                .select()
                .single();

            if (testError) {
                console.error('Error creating test:', testError);
                continue;
            }

            const questions = [];
            // Generate 10 questions for this test
            for (let q = 1; q <= 10; q++) {
                let content = `Sample ${category} question #${q}. The blank is _______ to the context.`;
                let type = 'single_choice';
                let options = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];
                let correctAnswer = [0];

                if (category === 'Double Blanks' || category === 'Triple Blanks') {
                    content = `Sample multi-blank question #${q}. Blank (i) _______ and Blank (ii) _______.`;
                    options = ['A (i)', 'B (i)', 'C (i)', 'D (ii)', 'E (ii)', 'F (ii)']; // Simplified for seeding
                    correctAnswer = [0, 3];
                } else if (category === 'Sentence Equivalence') {
                    type = 'multi_choice';
                    content = `Select the two answer choices that fittingly complete the sentence. Question #${q}.`;
                    options = ['Word A', 'Word B', 'Word C', 'Word D', 'Word E', 'Word F'];
                    correctAnswer = [0, 2];
                } else if (category === 'Reading Comprehension') {
                    content = `Passage for Question #${q}:\nLorem ipsum dolor sit amet... (Short passage)`;
                }

                questions.push({
                    test_id: test.id,
                    content,
                    type,
                    options: options, // JSONB handles array natively
                    correct_answer: correctAnswer,
                    explanation: 'This is a placeholder explanation for the correct answer.',
                    order_index: q
                });
            }

            const { error: qError } = await supabase.from('questions').insert(questions);
            if (qError) console.error('Error creating questions:', qError);
        }
    }

    console.log('Seeding complete!');
}

seed();
