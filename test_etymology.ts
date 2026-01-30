import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: any = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim().replace(/"/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const word = 'endemic';
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
        body: { word, definition: 'native to a specific region', mode: 'etymology' }
    });
    console.log('Result:', data);
}
test();
