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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { count, error } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .is('part_of_speech', null);

    const { count: total } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true });

    console.log(`Total cards: ${total}`);
    console.log(`Missing POS: ${count}`);
}

check().catch(console.error);
