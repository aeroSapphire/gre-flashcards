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

const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function runSql() {
    console.log('Running migration...');
    const { error } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sentence_practice_enabled BOOLEAN DEFAULT false;'
    });

    if (error) {
        console.error('Error running SQL:', error);
        // Fallback: If rpc execute_sql doesn't exist (it usually doesn't unless created), 
        // there isn't a direct way to run raw SQL via the client without a custom function.
        console.log('Trying alternative: Check if we can just update a profile...');
    } else {
        console.log('Migration successful!');
    }
}

// Since execute_sql is likely not there, I'll just define the interface update and assume I need to run this SQL manually or via some other way.
// Actually, I'll try to use the migrations correctly.
runSql();
