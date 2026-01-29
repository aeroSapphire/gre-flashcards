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

const PASSAGES = [
    {
        title: "Opera",
        text: "Opera refers to a dramatic art form, originating in Europe, in which the emotional content is conveyed to the audience as much through music, both vocal and instrumental, as it is through the lyrics. By contrast, in musical theater an actor's dramatic performance is primary, and the music plays a lesser role. The drama in opera is presented using the primary elements of theater such as scenery, costumes, and acting. However, the words of the opera, or libretto, are sung rather than spoken. The singers are accompanied by a musical ensemble ranging from a small instrumental ensemble to a full symphonic orchestra."
    },
    {
        title: "Dolphins",
        text: "Dolphins are regarded as the friendliest creatures in the sea and stories of them helping drowning sailors have been common since Roman times. The more we learn about dolphins, the more we realize that their society is more complex than people previously imagined. They look after other dolphins when they are ill, care for pregnant mothers and protect the weakest in the community, as we do. Some scientists have suggested that dolphins have a language but it is much more probable that they communicate with each other without needing words. Could any of these mammals be more intelligent than man?"
    },
    {
        title: "Unsinkable Ship",
        text: "Naval architects never claim that a ship is unsinkable, but the sinking of the passenger-and-car ferry Estonia in the Baltic surely should have never have happened. It was well designed and carefully maintained. It carried the proper number of lifeboats. It had been thoroughly inspected the day of its fatal voyage. Yet hours later, the Estonia rolled over and sank in a cold, stormy night. It went down so quickly that most of those on board, caught in their dark, flooding cabins, had no chance to save themselves."
    },
    {
        title: "Erosion in America",
        text: "Erosion of America's farmland by wind and water has been a problem since settlers first put the prairies and grasslands under the plow in the nineteenth century. By the 1930s, more than 282 million acres of farmland were damaged by erosion. After 40 years of conservation efforts, soil erosion has accelerated due to new demands placed on the land by heavy crop production. In the years ahead, soil erosion and the pollution problems it causes are likely to replace petroleum scarcity as the nation's most critical natural resource problem."
    },
    {
        title: "Tomatoes & Lycopene",
        text: "The cancer-preventing properties of tomato products have been attributed to lycopene. It is a bright red pigment found in tomatoes and other red fruits and is the cause of their red color. Unlike other fruits and vegetables, where nutritional content such as vitamin C is diminished upon cooking, processing of tomatoes increases the concentration of lycopene. Lycopene in tomato paste is four times more than in fresh tomatoes. This is because lycopene is insoluble in water and is tightly bound to vegetable fiber. Thus, processed tomato products such as pasteurized tomato juice, soup, sauce, and ketchup contain the highest concentrations of lycopene."
    },
    {
        title: "Grammar vs Vocabulary",
        text: "Traditionally, many linguists stressed the importance of mastering grammar structures first while teaching English. In recent years, the majority of educators have become more aware of the fallacy of this approach and other approaches promoting vocabulary development have gained popularity. It has been found out without vocabulary to put on top of the grammar system, the learners can actually say very little despite being able to manipulate complex grammatical structures in exercise drills. Native speakers have a vocabulary of about 20,000 words but foreign learners of English need far fewer."
    },
    {
        title: "Slavery",
        text: "Slavery is a system under which certain persons are totally deprived of personal freedom and compelled to perform labor or services. Although outlawed in nearly all countries, slavery is still practiced in some parts of the world. The evidence for slavery predates written records. It can be found in almost all cultures and continents. Historically, most slaves were captured in wars but some persons were sold into slavery by their parents, or by themselves, as a means of surviving extreme conditions."
    }
];

async function importRC() {
    console.log(`🚀 Importing ${PASSAGES.length} Reading Comprehension passages...`);

    for (const passage of PASSAGES) {
        console.log(`\n📝 Processing: ${passage.title}`);

        try {
            // 1. Generate questions using AI
            const { data: aiResponse, error: invokeError } = await supabase.functions.invoke('evaluate-sentence', {
                body: { sentence: passage.text, mode: 'rc' }
            });

            if (invokeError) {
                console.error(`  ❌ AI Generation failed for ${passage.title}:`, invokeError);
                continue;
            }

            let questionsData = aiResponse;
            if (typeof aiResponse === 'string') {
                questionsData = JSON.parse(aiResponse);
            }

            if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
                console.error(`  ❌ Invalid AI response format for ${passage.title}`);
                continue;
            }

            // 2. Create the test
            const { data: test, error: testError } = await supabase
                .from('tests')
                .insert({
                    title: `RC - ${passage.title}`,
                    category: 'Reading Comprehension',
                    description: `Short passage about ${passage.title}. Answer 3 comprehension questions.`,
                    time_limit_minutes: 5
                })
                .select()
                .single();

            if (testError) {
                console.error(`  ❌ Failed to create test for ${passage.title}:`, testError);
                continue;
            }

            // 3. Insert questions
            // The passage is added as a prefix to the first question or as a separate piece of content
            // In our current TestRunner, content is displayed per question.
            // So we'll prepend the passage to each question or at least the first one.
            const formattedQuestions = questionsData.questions.map((q: any, idx: number) => ({
                test_id: test.id,
                content: idx === 0 ? `PASSAGE:\n\n${passage.text}\n\n---\n\nQUESTION:\n${q.content}` : q.content,
                type: q.type || 'single_choice',
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                order_index: idx
            }));

            const { error: qError } = await supabase.from('questions').insert(formattedQuestions);
            if (qError) {
                console.error(`  ❌ Failed to insert questions for ${passage.title}:`, qError);
            } else {
                console.log(`  ✅ Successfully imported ${passage.title} with ${formattedQuestions.length} questions.`);
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`  ❌ Unexpected error for ${passage.title}:`, err);
        }
    }

    console.log('\n✨ Import complete!');
}

importRC();
