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
        root: "Spec / Spic",
        meaning: "To Look / To See",
        origin: "Latin",
        words: [
            { word: "Perspicacious", definition: "Having a ready insight into and understanding of things.", breakdown: "per (through) + specere (to look)" },
            { word: "Conspicuous", definition: "Standing out so as to be clearly visible.", breakdown: "con (completely) + specere (to look)" },
            { word: "Specious", definition: "Superficially plausible, but actually wrong.", breakdown: "species (appearance) + specere (to look)" }
        ]
    },
    {
        root: "Amb / Amphi",
        meaning: "Both / Around",
        origin: "Latin/Greek",
        words: [
            { word: "Ambivalent", definition: "Having mixed feelings or contradictory ideas about something or someone.", breakdown: "ambi (both) + valent (power)" },
            { word: "Ambiguous", definition: "Open to more than one interpretation.", breakdown: "ambi (both) + agere (to drive/do)" },
            { word: "Ambidextrous", definition: "Able to use the right and left hands equally well.", breakdown: "ambi (both) + dexter (right-handed)" }
        ]
    },
    {
        root: "Anim",
        meaning: "Soul / Life / Mind",
        origin: "Latin",
        words: [
            { word: "Equanimity", definition: "Mental calmness, composure, and evenness of temper.", breakdown: "aequus (even) + animus (mind)" },
            { word: "Magnanimous", definition: "Generous or forgiving, especially toward a rival.", breakdown: "magnus (great) + animus (soul)" },
            { word: "Pusillanimous", definition: "Showing a lack of courage or determination; timid.", breakdown: "pusillus (very small) + animus (soul)" }
        ]
    },
    {
        root: "Doc / Doct",
        meaning: "To Teach",
        origin: "Latin",
        words: [
            { word: "Docile", definition: "Ready to accept control or instruction; submissive.", breakdown: "docere (to teach)" },
            { word: "Doctrinaire", definition: "Seeking to impose a doctrine in all circumstances without regard to practical considerations.", breakdown: "doctrina (learning/doctrine)" },
            { word: "Docent", definition: "A person who acts as a guide, typically on a voluntary basis, in a museum.", breakdown: "docere (to teach)" }
        ]
    },
    {
        root: "Morph",
        meaning: "Shape / Form",
        origin: "Greek",
        words: [
            { word: "Anthropomorphism", definition: "The attribution of human characteristics or behavior to a god, animal, or object.", breakdown: "anthropos (human) + morphe (form)" },
            { word: "Metamorphosis", definition: "The process of transformation from an immature form to an adult form.", breakdown: "meta (change) + morphe (form)" },
            { word: "Morphic", definition: "Relating to shape or form.", breakdown: "morphe (form)" }
        ]
    },
    {
        root: "Gen",
        meaning: "Origin / Kind / Birth",
        origin: "Greek/Latin",
        words: [
            { word: "Engender", definition: "Cause or give rise to (a feeling, situation, or condition).", breakdown: "en (in) + generare (beget)" },
            { word: "Indigenous", definition: "Originating or occurring naturally in a particular place; native.", breakdown: "indu (within) + gignere (to beget)" },
            { word: "Gentility", definition: "Social superiority as demonstrated by genteel manners, behavior, or appearances.", breakdown: "gentilis (of the same clan/race)" }
        ]
    },
    {
        root: "In / Im",
        meaning: "Not / Opposite",
        origin: "Latin",
        words: [
            { word: "Innocuous", definition: "Not harmful or offensive.", breakdown: "in (not) + nocuus (harmful)" },
            { word: "Inscrutable", definition: "Impossible to understand or interpret.", breakdown: "in (not) + scrutari (to search)" },
            { word: "Implacable", definition: "Relentless; unstoppable.", breakdown: "in (not) + placare (to appease)" }
        ]
    },
    {
        root: "Log / Loqu",
        meaning: "Word / Thought / Speech",
        origin: "Greek/Latin",
        words: [
            { word: "Eulogy", definition: "A speech or piece of writing that praises someone or something highly.", breakdown: "eu (well) + logos (word)" },
            { word: "Neologism", definition: "A newly coined word or expression.", breakdown: "neos (new) + logos (word)" },
            { word: "Soliloquy", definition: "An act of speaking one's thoughts aloud when by oneself.", breakdown: "solus (alone) + loqui (to speak)" }
        ]
    },
    {
        root: "Pug",
        meaning: "To Fight / Fist",
        origin: "Latin",
        words: [
            { word: "Pugnacious", definition: "Eager or quick to argue, quarrel, or fight.", breakdown: "pugnare (to fight)" },
            { word: "Impugn", definition: "Dispute the truth, validity, or honesty of (a statement or motive).", breakdown: "in (against) + pugnare (to fight)" },
            { word: "Repugnant", definition: "Extremely distasteful; unacceptable.", breakdown: "re (against) + pugnare (to fight)" }
        ]
    },
    {
        root: "Voc / Vok",
        meaning: "To Call",
        origin: "Latin",
        words: [
            { word: "Equivocate", definition: "Use ambiguous language so as to conceal the truth.", breakdown: "aequus (equal) + vocare (to call)" },
            { word: "Vociferous", definition: "Vehement or clamorous.", breakdown: "vox (voice) + ferre (to carry)" },
            { word: "Provocative", definition: "Causing annoyance, anger, or another strong reaction.", breakdown: "pro (forth) + vocare (to call)" }
        ]
    },
    {
        root: "Ver",
        meaning: "Truth",
        origin: "Latin",
        words: [
            { word: "Veracity", definition: "Conformity to facts; accuracy; habitual truthfulness.", breakdown: "verax (true)" },
            { word: "Verisimilitude", definition: "The appearance of being true or real.", breakdown: "verus (true) + similis (like)" },
            { word: "Aver", definition: "State or assert to be the case.", breakdown: "ad (to) + verus (true)" }
        ]
    },
    {
        root: "Chrono",
        meaning: "Time",
        origin: "Greek",
        words: [
            { word: "Anachronism", definition: "Something that is out of place in time.", breakdown: "ana (against) + chronos (time)" },
            { word: "Chronological", definition: "Starting with the earliest and following the order in which they occurred.", breakdown: "chronos (time) + logos (word/reason)" },
            { word: "Synchronous", definition: "Existing or occurring at the same time.", breakdown: "syn (together) + chronos (time)" }
        ]
    },
    {
        root: "Eu",
        meaning: "Good / Well / Pleasant",
        origin: "Greek",
        words: [
            { word: "Euphemism", definition: "A mild or indirect expression substituted for one considered to be too harsh.", breakdown: "eu (well) + pheme (speaking)" },
            { word: "Euphoria", definition: "A feeling or state of intense excitement and happiness.", breakdown: "eu (well) + pherein (to bear)" },
            { word: "Euphonious", definition: "Pleasing to the ear.", breakdown: "eu (well) + phone (sound)" }
        ]
    }
];

async function seedBulkEtymology() {
    console.log('--- Starting Bulk Etymology Seeding ---');

    for (const item of etymologyData) {
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
            console.error(`Error with root ${item.root}:`, rootError.message);
            continue;
        }

        console.log(`Processing root: ${item.root}`);

        const wordsToInsert = item.words.map(w => ({
            ...w,
            root_id: rootData.id
        }));

        const { error: wordsError } = await supabase
            .from('etymology_words')
            .upsert(wordsToInsert, { onConflict: 'word' });

        if (wordsError) {
            console.error(`Error inserting words for ${item.root}:`, wordsError.message);
        } else {
            console.log(`  Added ${item.words.length} words to ${item.root}`);
        }
    }

    console.log('--- Bulk Seeding Complete ---');
}

seedBulkEtymology().catch(console.error);
