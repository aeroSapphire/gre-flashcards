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

const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const etymologyData = [
    {
        root: "Circum",
        meaning: "Around",
        origin: "Latin",
        words: [
            {
                word: "Circumspect",
                definition: "Wary and unwilling to take risks.",
                breakdown: "circum (around) + specere (to look)"
            },
            {
                word: "Circumlocution",
                definition: "The use of many words where fewer would do, especially in a deliberate attempt to be vague or evasive.",
                breakdown: "circum (around) + loqui (to speak)"
            },
            {
                word: "Circumvent",
                definition: "Find a way around (an obstacle).",
                breakdown: "circum (around) + venire (to come)"
            }
        ]
    },
    {
        root: "Bene",
        meaning: "Good / Well",
        origin: "Latin",
        words: [
            {
                word: "Beneficent",
                definition: "Generous or doing good.",
                breakdown: "bene (good) + facere (to do)"
            },
            {
                word: "Benevolent",
                definition: "Well meaning and kindly.",
                breakdown: "bene (well) + velle (to wish)"
            },
            {
                word: "Benediction",
                definition: "The utterance or bestowing of a blessing.",
                breakdown: "bene (well) + dicere (to speak)"
            }
        ]
    },
    {
        root: "Mal",
        meaning: "Bad / Evil",
        origin: "Latin",
        words: [
            {
                word: "Malevolent",
                definition: "Having or showing a wish to do evil to others.",
                breakdown: "mal (bad) + velle (to wish)"
            },
            {
                word: "Malign",
                definition: "Evil in nature or effect; malevolent.",
                breakdown: "malus (bad)"
            },
            {
                word: "Malediction",
                definition: "A magical word or phrase uttered with the intention of bringing about evil; a curse.",
                breakdown: "male (badly) + dicere (to speak)"
            }
        ]
    },
    {
        root: "Loqu / Locut",
        meaning: "To Speak",
        origin: "Latin",
        words: [
            {
                word: "Loquacious",
                definition: "Tending to talk a great deal; talkative.",
                breakdown: "loqui (to speak)"
            },
            {
                word: "Eloquent",
                definition: "Fluent or persuasive in speaking or writing.",
                breakdown: "ex (out) + loqui (to speak)"
            },
            {
                word: "Magniloquent",
                definition: "Using high-flown or bombastic language.",
                breakdown: "magnus (great) + loqui (to speak)"
            }
        ]
    },
    {
        root: "A- / An-",
        meaning: "Without / Not",
        origin: "Greek",
        words: [
            {
                word: "Anomaly",
                definition: "Something that deviates from what is standard, normal, or expected.",
                breakdown: "a (not) + homalos (even)"
            },
            {
                word: "Amorphous",
                definition: "Without a clearly defined shape or form.",
                breakdown: "a (without) + morphe (form)"
            },
            {
                word: "Apathy",
                definition: "Lack of interest, enthusiasm, or concern.",
                breakdown: "a (without) + pathos (feeling)"
            }
        ]
    },
    {
        root: "Path",
        meaning: "Feeling / Suffering",
        origin: "Greek",
        words: [
            {
                word: "Antipathy",
                definition: "A deep-seated feeling of dislike; aversion.",
                breakdown: "anti (against) + pathos (feeling)"
            },
            {
                word: "Pathos",
                definition: "A quality that evokes pity or sadness.",
                breakdown: "pathos (suffering)"
            },
            {
                word: "Empathy",
                definition: "The ability to understand and share the feelings of another.",
                breakdown: "en (in) + pathos (feeling)"
            }
        ]
    }
];

async function seedEtymology() {
    console.log('Starting Etymology seeding...');

    for (const item of etymologyData) {
        // Insert root
        const { data: rootData, error: rootError } = await supabase
            .from('etymology_roots')
            .upsert({
                root: item.root,
                meaning: item.meaning,
                origin: item.origin
            }, { onConflict: 'root' })
            .select()
            .single();

        if (rootError) {
            console.error(`Error inserting root ${item.root}:`, rootError.message);
            continue;
        }

        console.log(`Inserted root: ${item.root}`);

        // Insert words for this root
        const wordsToInsert = item.words.map(w => ({
            ...w,
            root_id: rootData.id
        }));

        const { error: wordsError } = await supabase
            .from('etymology_words')
            .upsert(wordsToInsert, { onConflict: 'word' }); // Assuming word is unique for simplicity in seed

        if (wordsError) {
            console.error(`Error inserting words for ${item.root}:`, wordsError.message);
        } else {
            console.log(`  Inserted ${item.words.length} words for ${item.root}`);
        }
    }

    console.log('Seeding complete!');
}

seedEtymology().catch(console.error);
