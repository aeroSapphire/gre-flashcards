import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
    env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// ============================================================================
// NO SHIFT SENTENCES - Tests 3 & 4
// ============================================================================
const noShiftTests = [
    {
        title: 'No Shift Sentences - Test 3',
        category: 'No Shift Sentences',
        description: 'Practice single-blank text completion with academic vocabulary.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'The archaeologist\'s discoveries were so _______ that they forced historians to completely revise their understanding of ancient trade routes.',
                type: 'single_choice',
                options: ['inconsequential', 'groundbreaking', 'predictable', 'trivial', 'unremarkable'],
                correct_answer: [0],
                explanation: '"Groundbreaking" means innovative or pioneering. Discoveries that force complete revision of understanding must be significant and revolutionary. The other options suggest insignificance.',
                difficulty: 'easy'
            },
            {
                content: 'The new employee\'s _______ attitude quickly earned her the trust of her colleagues, who appreciated her willingness to help without expecting anything in return.',
                type: 'single_choice',
                options: ['selfish', 'altruistic', 'calculating', 'mercenary', 'opportunistic'],
                correct_answer: [1],
                explanation: '"Altruistic" means selflessly concerned for others. Helping without expecting return indicates unselfish behavior. The other options suggest self-interested motivations.',
                difficulty: 'easy'
            },
            {
                content: 'The treaty negotiations required _______ attention to detail, as even minor oversights could derail the entire peace process.',
                type: 'single_choice',
                options: ['cursory', 'scrupulous', 'negligent', 'careless', 'superficial'],
                correct_answer: [1],
                explanation: '"Scrupulous" means diligent and thorough. When minor oversights can cause major problems, extreme care is needed. The other options suggest insufficient attention.',
                difficulty: 'medium'
            },
            {
                content: 'The conductor\'s interpretation of the symphony was refreshingly _______, offering new insights into a work that audiences thought they knew intimately.',
                type: 'single_choice',
                options: ['conventional', 'original', 'derivative', 'imitative', 'orthodox'],
                correct_answer: [1],
                explanation: '"Original" means novel and inventive. Offering new insights into familiar work indicates a fresh perspective. The other options suggest adherence to existing interpretations.',
                difficulty: 'medium'
            },
            {
                content: 'The scientist\'s _______ nature led her to question even the most established theories, a trait that ultimately led to her breakthrough discoveries.',
                type: 'single_choice',
                options: ['credulous', 'inquisitive', 'gullible', 'trusting', 'accepting'],
                correct_answer: [1],
                explanation: '"Inquisitive" means curious and eager to learn. Questioning established theories indicates a questioning mind. The other options suggest accepting things without question.',
                difficulty: 'easy'
            },
            {
                content: 'The author\'s memoir was praised for its _______ honesty, as she unflinchingly examined her own failures and shortcomings.',
                type: 'single_choice',
                options: ['evasive', 'unflinching', 'guarded', 'reticent', 'circumspect'],
                correct_answer: [1],
                explanation: '"Unflinching" means not showing fear or hesitation. Examining failures and shortcomings requires courage and directness. The other options suggest avoidance or caution.',
                difficulty: 'medium'
            },
            {
                content: 'The urban planner\'s _______ approach considered not just immediate needs but also how the city would evolve over the coming decades.',
                type: 'single_choice',
                options: ['myopic', 'farsighted', 'shortsighted', 'narrow', 'limited'],
                correct_answer: [1],
                explanation: '"Farsighted" means having imagination and forethought about the future. Considering long-term evolution indicates planning ahead. The other options suggest limited vision.',
                difficulty: 'medium'
            },
            {
                content: 'The documentary filmmaker\'s _______ commitment to accuracy meant spending months verifying even minor details before including them in her films.',
                type: 'single_choice',
                options: ['lax', 'rigorous', 'casual', 'relaxed', 'indifferent'],
                correct_answer: [1],
                explanation: '"Rigorous" means extremely thorough and careful. Months of verification for minor details indicates exacting standards. The other options suggest insufficient care.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat was known for her _______ manner, able to deliver difficult messages without giving offense.',
                type: 'single_choice',
                options: ['tactless', 'diplomatic', 'blunt', 'brusque', 'abrasive'],
                correct_answer: [1],
                explanation: '"Diplomatic" means skilled at dealing with sensitive matters. Delivering difficult messages without offense requires tact. The other options suggest insensitivity.',
                difficulty: 'easy'
            },
            {
                content: 'The professor\'s _______ knowledge of Renaissance art, accumulated over four decades of study, made her the definitive authority in the field.',
                type: 'single_choice',
                options: ['superficial', 'encyclopedic', 'limited', 'narrow', 'cursory'],
                correct_answer: [1],
                explanation: '"Encyclopedic" means comprehensive and wide-ranging. Four decades of study creating definitive authority indicates vast knowledge. The other options suggest incomplete understanding.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'No Shift Sentences - Test 4',
        category: 'No Shift Sentences',
        description: 'Challenging single-blank questions testing nuanced vocabulary.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'The witness\'s account was so _______ that investigators had no trouble reconstructing the sequence of events.',
                type: 'single_choice',
                options: ['vague', 'detailed', 'ambiguous', 'muddled', 'confused'],
                correct_answer: [1],
                explanation: '"Detailed" means including many facts or pieces of information. Easy reconstruction requires a clear, thorough account. The other options suggest unclear or incomplete information.',
                difficulty: 'easy'
            },
            {
                content: 'The company\'s _______ growth strategy, expanding into new markets while strengthening existing ones, positioned it for long-term success.',
                type: 'single_choice',
                options: ['reckless', 'prudent', 'haphazard', 'impulsive', 'careless'],
                correct_answer: [1],
                explanation: '"Prudent" means acting with care and thought for the future. A balanced strategy for long-term success indicates wisdom. The other options suggest poor planning.',
                difficulty: 'medium'
            },
            {
                content: 'The chef\'s _______ use of spices transformed simple ingredients into extraordinary dishes.',
                type: 'single_choice',
                options: ['clumsy', 'masterful', 'inept', 'awkward', 'bungling'],
                correct_answer: [1],
                explanation: '"Masterful" means performed with great skill. Transforming simple ingredients into extraordinary dishes requires expertise. The other options suggest lack of skill.',
                difficulty: 'easy'
            },
            {
                content: 'The researcher\'s _______ dedication to her work meant sacrificing weekends and holidays to complete the study on time.',
                type: 'single_choice',
                options: ['halfhearted', 'unwavering', 'tepid', 'lukewarm', 'feeble'],
                correct_answer: [1],
                explanation: '"Unwavering" means steady and resolute. Sacrificing personal time shows constant commitment. The other options suggest weak or inconsistent effort.',
                difficulty: 'medium'
            },
            {
                content: 'The new policy was designed to be _______, applying equally to all employees regardless of their position in the company.',
                type: 'single_choice',
                options: ['discriminatory', 'equitable', 'biased', 'partial', 'prejudiced'],
                correct_answer: [1],
                explanation: '"Equitable" means fair and impartial. Applying equally to all indicates fairness. The other options suggest unfair treatment.',
                difficulty: 'medium'
            },
            {
                content: 'The novelist\'s prose was remarkably _______, conveying complex emotions with seemingly effortless simplicity.',
                type: 'single_choice',
                options: ['labored', 'elegant', 'clunky', 'awkward', 'stilted'],
                correct_answer: [1],
                explanation: '"Elegant" means pleasingly graceful and stylish. Effortless simplicity conveying complexity indicates refinement. The other options suggest difficult or ungainly writing.',
                difficulty: 'hard'
            },
            {
                content: 'The surgeon\'s _______ hands never trembled, even during the most delicate procedures.',
                type: 'single_choice',
                options: ['unsteady', 'steady', 'shaky', 'trembling', 'quivering'],
                correct_answer: [1],
                explanation: '"Steady" means firmly fixed and not shaking. Never trembling during delicate work requires stability. The other options all suggest movement or instability.',
                difficulty: 'easy'
            },
            {
                content: 'The journalist\'s _______ reporting exposed corruption that had gone undetected for years.',
                type: 'single_choice',
                options: ['superficial', 'investigative', 'cursory', 'shallow', 'perfunctory'],
                correct_answer: [1],
                explanation: '"Investigative" means thoroughly researching and examining. Exposing hidden corruption requires deep inquiry. The other options suggest insufficient depth.',
                difficulty: 'medium'
            },
            {
                content: 'The ambassador\'s _______ response to the diplomatic crisis prevented what could have been a serious international incident.',
                type: 'single_choice',
                options: ['clumsy', 'deft', 'heavy-handed', 'maladroit', 'bungling'],
                correct_answer: [1],
                explanation: '"Deft" means demonstrating skill and cleverness. Preventing a crisis requires skillful handling. The other options suggest lack of skill or finesse.',
                difficulty: 'hard'
            },
            {
                content: 'The museum\'s collection was _______, spanning five continents and three thousand years of human history.',
                type: 'single_choice',
                options: ['limited', 'vast', 'modest', 'narrow', 'restricted'],
                correct_answer: [1],
                explanation: '"Vast" means of very great extent. Five continents and three thousand years indicates enormous scope. The other options suggest smaller scale.',
                difficulty: 'easy'
            }
        ]
    }
];

// ============================================================================
// SHIFT SENTENCES - Tests 3 & 4
// ============================================================================
const shiftTests = [
    {
        title: 'Shift Sentences - Test 3',
        category: 'Shift Sentences',
        description: 'Practice recognizing contrast signals and completing opposing ideas.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'Although the movie received _______ reviews from professional critics, it became a massive box office success.',
                type: 'single_choice',
                options: ['rave', 'glowing', 'scathing', 'enthusiastic', 'laudatory'],
                correct_answer: [2],
                explanation: '"Although" signals contrast. Box office success (positive) contrasts with the reviews, which must be negative. "Scathing" means severely critical.',
                difficulty: 'easy'
            },
            {
                content: 'Despite his _______ exterior, the gruff mechanic was known to spend his weekends volunteering at the children\'s hospital.',
                type: 'single_choice',
                options: ['warm', 'forbidding', 'approachable', 'welcoming', 'friendly'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. Volunteering at a children\'s hospital (warm behavior) contrasts with his exterior. "Forbidding" means unfriendly or threatening in appearance.',
                difficulty: 'easy'
            },
            {
                content: 'While the initial data appeared _______, further analysis revealed significant flaws in the experimental methodology.',
                type: 'single_choice',
                options: ['flawed', 'promising', 'questionable', 'dubious', 'suspect'],
                correct_answer: [1],
                explanation: '"While" signals contrast. Significant flaws (negative) contrasts with initial appearance. "Promising" means showing signs of future success.',
                difficulty: 'medium'
            },
            {
                content: 'The professor\'s lectures, though _______ in their presentation, contained profound insights that rewarded careful attention.',
                type: 'single_choice',
                options: ['engaging', 'tedious', 'captivating', 'riveting', 'compelling'],
                correct_answer: [1],
                explanation: '"Though" signals contrast. Profound insights rewarding attention (positive content) contrasts with presentation. "Tedious" means too long, slow, or dull.',
                difficulty: 'medium'
            },
            {
                content: 'However _______ the proposed solution may seem, experts warn that implementing it would create more problems than it solves.',
                type: 'single_choice',
                options: ['problematic', 'appealing', 'flawed', 'defective', 'impractical'],
                correct_answer: [1],
                explanation: '"However...may seem" signals contrast with reality. Creating more problems (negative reality) contrasts with appearance. "Appealing" means attractive or interesting.',
                difficulty: 'medium'
            },
            {
                content: 'Far from being _______ by the setback, the team used the failure as motivation to redouble their efforts.',
                type: 'single_choice',
                options: ['motivated', 'demoralized', 'inspired', 'energized', 'encouraged'],
                correct_answer: [1],
                explanation: '"Far from being" signals contrast. Redoubling efforts (positive response) means they were NOT demoralized. "Demoralized" means having lost confidence or hope.',
                difficulty: 'easy'
            },
            {
                content: 'The politician\'s public image of _______ was contradicted by leaked documents revealing years of corrupt dealings.',
                type: 'single_choice',
                options: ['dishonesty', 'probity', 'corruption', 'venality', 'duplicity'],
                correct_answer: [1],
                explanation: '"Contradicted by" signals contrast. Corrupt dealings (negative reality) contradicts public image. "Probity" means strong moral principles and honesty.',
                difficulty: 'hard'
            },
            {
                content: 'Though the artist\'s technique was _______, her work failed to connect emotionally with viewers.',
                type: 'single_choice',
                options: ['flawed', 'impeccable', 'deficient', 'lacking', 'inadequate'],
                correct_answer: [1],
                explanation: '"Though" signals contrast. Failing to connect (negative) contrasts with technique. "Impeccable" means flawless or perfect.',
                difficulty: 'medium'
            },
            {
                content: 'Despite the company\'s _______ financial situation, management continued to assure investors that all was well.',
                type: 'single_choice',
                options: ['robust', 'precarious', 'stable', 'healthy', 'sound'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. Assuring all is well (positive message) contrasts with actual situation. "Precarious" means not securely held, dangerously uncertain.',
                difficulty: 'hard'
            },
            {
                content: 'Although she projected an air of _______ during negotiations, she later admitted to feeling extremely anxious throughout the process.',
                type: 'single_choice',
                options: ['nervousness', 'composure', 'agitation', 'anxiety', 'unease'],
                correct_answer: [1],
                explanation: '"Although" signals contrast. Feeling extremely anxious (internal reality) contrasts with projected air. "Composure" means calmness and self-control.',
                difficulty: 'easy'
            }
        ]
    },
    {
        title: 'Shift Sentences - Test 4',
        category: 'Shift Sentences',
        description: 'Advanced contrast recognition with sophisticated vocabulary.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'While the evidence for the defendant\'s guilt was _______, the jury still voted to convict.',
                type: 'single_choice',
                options: ['overwhelming', 'tenuous', 'compelling', 'conclusive', 'damning'],
                correct_answer: [1],
                explanation: '"While" signals contrast. Conviction (strong outcome) despite the evidence suggests the evidence was weak. "Tenuous" means very weak or slight.',
                difficulty: 'medium'
            },
            {
                content: 'Despite his _______ manner of speaking, the diplomat\'s messages were always crystal clear to those who listened carefully.',
                type: 'single_choice',
                options: ['direct', 'circuitous', 'straightforward', 'blunt', 'forthright'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. Crystal clear messages contrast with manner of speaking. "Circuitous" means roundabout and indirect.',
                difficulty: 'hard'
            },
            {
                content: 'Though the restaurant\'s ambiance was _______, the food more than compensated with its exceptional quality.',
                type: 'single_choice',
                options: ['elegant', 'spartan', 'luxurious', 'opulent', 'sumptuous'],
                correct_answer: [1],
                explanation: '"Though" signals contrast. Needing to compensate (for something negative) contrasts with exceptional food. "Spartan" means severely simple and lacking comfort.',
                difficulty: 'medium'
            },
            {
                content: 'Far from displaying the _______ that his reputation suggested, the celebrity was surprisingly down-to-earth and approachable.',
                type: 'single_choice',
                options: ['humility', 'arrogance', 'modesty', 'warmth', 'friendliness'],
                correct_answer: [1],
                explanation: '"Far from displaying" signals contrast. Down-to-earth and approachable means he was NOT arrogant. "Arrogance" means having an exaggerated sense of importance.',
                difficulty: 'easy'
            },
            {
                content: 'However _______ the negotiations appeared to outside observers, the participants knew they were making significant progress.',
                type: 'single_choice',
                options: ['productive', 'fruitless', 'successful', 'promising', 'hopeful'],
                correct_answer: [1],
                explanation: '"However...appeared" signals contrast with reality. Significant progress (actual situation) contrasts with appearance. "Fruitless" means failing to achieve results.',
                difficulty: 'medium'
            },
            {
                content: 'Although the manuscript was initially _______ by every major publisher, it went on to become one of the bestselling novels of the century.',
                type: 'single_choice',
                options: ['accepted', 'rejected', 'celebrated', 'embraced', 'welcomed'],
                correct_answer: [1],
                explanation: '"Although" signals contrast. Bestselling success contrasts with initial reception. "Rejected" means dismissed or refused.',
                difficulty: 'easy'
            },
            {
                content: 'The scientist\'s theory, while _______ in its mathematical formulation, has proven remarkably accurate in predicting real-world phenomena.',
                type: 'single_choice',
                options: ['elegant', 'abstruse', 'simple', 'accessible', 'clear'],
                correct_answer: [1],
                explanation: '"While" signals contrast. Practical accuracy contrasts with the formulation. "Abstruse" means difficult to understand, obscure.',
                difficulty: 'hard'
            },
            {
                content: 'Despite the _______ of resources available for the project, the team managed to deliver impressive results.',
                type: 'single_choice',
                options: ['abundance', 'paucity', 'wealth', 'plenty', 'profusion'],
                correct_answer: [1],
                explanation: '"Despite" signals overcoming an obstacle. Impressive results despite limited resources. "Paucity" means scarcity or insufficiency.',
                difficulty: 'hard'
            },
            {
                content: 'Though critics dismissed the work as _______, subsequent generations have recognized it as a masterpiece of modern literature.',
                type: 'single_choice',
                options: ['brilliant', 'mediocre', 'exceptional', 'remarkable', 'outstanding'],
                correct_answer: [1],
                explanation: '"Though" signals contrast. Masterpiece status contrasts with critics\' dismissal. "Mediocre" means of only moderate quality.',
                difficulty: 'easy'
            },
            {
                content: 'While her colleagues saw only _______ in the data, the researcher detected patterns that would lead to a breakthrough.',
                type: 'single_choice',
                options: ['order', 'chaos', 'clarity', 'structure', 'meaning'],
                correct_answer: [1],
                explanation: '"While" signals contrast. Detecting patterns contrasts with what colleagues saw. "Chaos" means complete disorder and confusion.',
                difficulty: 'medium'
            }
        ]
    }
];

// ============================================================================
// DOUBLE BLANKS - Tests 3 & 4
// ============================================================================
const doubleBlankTests = [
    {
        title: 'Double Blanks - Test 3',
        category: 'Double Blanks',
        description: 'Practice two-blank completion with interconnected meanings.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The artist\'s (i)_______ early works gave no hint of the (ii)_______ masterpieces she would create in her final years.',
                type: 'double_blank',
                options: ['(i) brilliant', '(i) unremarkable', '(i) stunning', '(ii) mediocre', '(ii) sublime', '(ii) ordinary'],
                correct_answer: [1, 4],
                explanation: '"Gave no hint" suggests early works didn\'t predict later greatness. "Unremarkable" early works contrast with "sublime" (outstanding) later masterpieces.',
                difficulty: 'easy'
            },
            {
                content: 'The documentary\'s (i)_______ approach to its subject, presenting multiple perspectives without bias, has been praised for its (ii)_______ treatment of a controversial topic.',
                type: 'double_blank',
                options: ['(i) partisan', '(i) balanced', '(i) slanted', '(ii) one-sided', '(ii) fair', '(ii) biased'],
                correct_answer: [1, 4],
                explanation: 'Multiple perspectives without bias indicates a "balanced" approach. This results in "fair" treatment of controversy.',
                difficulty: 'easy'
            },
            {
                content: 'The politician\'s (i)_______ promises during the campaign stood in stark contrast to his (ii)_______ actions once in office.',
                type: 'double_blank',
                options: ['(i) modest', '(i) grandiose', '(i) realistic', '(ii) ambitious', '(ii) timid', '(ii) bold'],
                correct_answer: [1, 4],
                explanation: '"Stark contrast" signals opposition. "Grandiose" (impressive, ambitious) promises contrast with "timid" (lacking courage) actions.',
                difficulty: 'medium'
            },
            {
                content: 'What began as a (i)_______ disagreement between the scientists eventually (ii)_______ into a bitter professional rivalry that lasted decades.',
                type: 'double_blank',
                options: ['(i) minor', '(i) major', '(i) serious', '(ii) resolved', '(ii) escalated', '(ii) diminished'],
                correct_answer: [0, 4],
                explanation: 'Starting small and ending as a bitter rivalry shows growth. A "minor" disagreement "escalated" (intensified) into something serious.',
                difficulty: 'easy'
            },
            {
                content: 'The novel\'s protagonist must choose between (i)_______ to societal expectations and pursuing her own (ii)_______ path, regardless of consequences.',
                type: 'double_blank',
                options: ['(i) conforming', '(i) objecting', '(i) succumbing', '(ii) conventional', '(ii) independent', '(ii) traditional'],
                correct_answer: [0, 4],
                explanation: 'The choice is between following society or self. "Conforming" to expectations opposes an "independent" path.',
                difficulty: 'medium'
            },
            {
                content: 'The CEO\'s (i)_______ communication style often left employees feeling uncertain, as her messages were open to (ii)_______ interpretations.',
                type: 'double_blank',
                options: ['(i) direct', '(i) ambiguous', '(i) clear', '(ii) single', '(ii) multiple', '(ii) obvious'],
                correct_answer: [1, 4],
                explanation: 'Uncertainty comes from unclear communication. "Ambiguous" messages allow "multiple" interpretations.',
                difficulty: 'medium'
            },
            {
                content: 'The historian\'s (i)_______ research uncovered evidence that (ii)_______ the long-accepted narrative about the revolution\'s origins.',
                type: 'double_blank',
                options: ['(i) superficial', '(i) meticulous', '(i) cursory', '(ii) supported', '(ii) contradicted', '(ii) confirmed'],
                correct_answer: [1, 4],
                explanation: 'Uncovering new evidence suggests thorough research. "Meticulous" (careful) research "contradicted" (opposed) the accepted narrative.',
                difficulty: 'hard'
            },
            {
                content: 'The therapist\'s (i)_______ approach, which emphasized listening over advising, helped patients feel (ii)_______ rather than judged.',
                type: 'double_blank',
                options: ['(i) directive', '(i) nondirective', '(i) authoritative', '(ii) criticized', '(ii) understood', '(ii) evaluated'],
                correct_answer: [1, 4],
                explanation: 'Emphasizing listening over advising is a "nondirective" approach. This helps patients feel "understood" instead of judged.',
                difficulty: 'hard'
            },
            {
                content: 'The architect\'s design was (i)_______ in its conception but proved (ii)_______ to implement within the project\'s budget constraints.',
                type: 'double_blank',
                options: ['(i) modest', '(i) visionary', '(i) practical', '(ii) easy', '(ii) impossible', '(ii) simple'],
                correct_answer: [1, 4],
                explanation: 'A grand idea that couldn\'t be realized suggests a gap between vision and reality. "Visionary" conception proved "impossible" to implement affordably.',
                difficulty: 'medium'
            },
            {
                content: 'The company\'s (i)_______ hiring practices, which favored credentials over potential, resulted in a workforce that was technically proficient but lacking in (ii)_______.',
                type: 'double_blank',
                options: ['(i) progressive', '(i) conventional', '(i) innovative', '(ii) creativity', '(ii) competence', '(ii) expertise'],
                correct_answer: [1, 4],
                explanation: 'Favoring credentials is traditional hiring. "Conventional" practices produced technical proficiency but lacked "creativity" (innovative thinking).',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Double Blanks - Test 4',
        category: 'Double Blanks',
        description: 'Advanced two-blank questions with nuanced relationships.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The memoir\'s (i)_______ account of the author\'s struggles resonated with readers who found her (ii)_______ about her failures refreshing.',
                type: 'double_blank',
                options: ['(i) guarded', '(i) candid', '(i) evasive', '(ii) reticence', '(ii) honesty', '(ii) secrecy'],
                correct_answer: [1, 4],
                explanation: 'An account that resonates and is refreshing suggests openness. A "candid" (frank, open) account demonstrates "honesty" about failures.',
                difficulty: 'easy'
            },
            {
                content: 'The professor\'s (i)_______ lectures, packed with information but delivered rapidly, required students to maintain (ii)_______ attention throughout.',
                type: 'double_blank',
                options: ['(i) sparse', '(i) dense', '(i) shallow', '(ii) minimal', '(ii) sustained', '(ii) occasional'],
                correct_answer: [1, 4],
                explanation: 'Packed with information delivered rapidly describes "dense" lectures. These require "sustained" (continuous) attention to follow.',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s (i)_______ approach to the crisis, taking measured steps rather than dramatic action, was (ii)_______ by hawks who demanded a more aggressive response.',
                type: 'double_blank',
                options: ['(i) rash', '(i) cautious', '(i) bold', '(ii) praised', '(ii) criticized', '(ii) supported'],
                correct_answer: [1, 4],
                explanation: 'Measured steps over dramatic action is "cautious." Hawks wanting aggression would have "criticized" this restraint.',
                difficulty: 'medium'
            },
            {
                content: 'The discovery\'s (i)_______ implications were not immediately apparent; only later did scientists recognize how fundamentally it would (ii)_______ their understanding of the field.',
                type: 'double_blank',
                options: ['(i) minor', '(i) profound', '(i) trivial', '(ii) confirm', '(ii) transform', '(ii) reinforce'],
                correct_answer: [1, 4],
                explanation: 'Fundamental change not immediately apparent suggests hidden importance. "Profound" implications eventually "transform" (fundamentally change) understanding.',
                difficulty: 'hard'
            },
            {
                content: 'The company\'s (i)_______ stance on environmental issues, neither fully committing to sustainability nor ignoring it entirely, has drawn (ii)_______ from activists and industry groups alike.',
                type: 'double_blank',
                options: ['(i) decisive', '(i) ambivalent', '(i) clear', '(ii) praise', '(ii) criticism', '(ii) support'],
                correct_answer: [1, 4],
                explanation: 'Neither fully committing nor ignoring indicates an "ambivalent" (mixed feelings) stance. This middle ground draws "criticism" from both sides.',
                difficulty: 'medium'
            },
            {
                content: 'The artist\'s (i)_______ use of color, applying paint in thick, visible strokes, gave her work a (ii)_______ quality that distinguished it from more refined styles.',
                type: 'double_blank',
                options: ['(i) subtle', '(i) bold', '(i) delicate', '(ii) polished', '(ii) raw', '(ii) elegant'],
                correct_answer: [1, 4],
                explanation: 'Thick, visible strokes indicate a "bold" approach. This creates a "raw" (natural, unrefined) quality contrasting with refined styles.',
                difficulty: 'medium'
            },
            {
                content: 'The economic forecast proved (i)_______, as the predicted recession failed to materialize; this (ii)_______ led analysts to reconsider their models.',
                type: 'double_blank',
                options: ['(i) accurate', '(i) erroneous', '(i) prescient', '(ii) success', '(ii) failure', '(ii) confirmation'],
                correct_answer: [1, 4],
                explanation: 'A prediction that didn\'t come true was "erroneous" (wrong). This "failure" prompted model reconsideration.',
                difficulty: 'easy'
            },
            {
                content: 'The author\'s (i)_______ prose, stripped of unnecessary ornamentation, conveyed complex ideas with remarkable (ii)_______.',
                type: 'double_blank',
                options: ['(i) ornate', '(i) spare', '(i) elaborate', '(ii) obscurity', '(ii) clarity', '(ii) confusion'],
                correct_answer: [1, 4],
                explanation: 'Stripped of ornamentation describes "spare" (simple, minimal) prose. This simplicity enables "clarity" in conveying ideas.',
                difficulty: 'hard'
            },
            {
                content: 'The merger was driven by the CEO\'s (i)_______ ambition rather than sound business logic, a fact that became apparent when the combined company\'s performance (ii)_______.',
                type: 'double_blank',
                options: ['(i) modest', '(i) unbridled', '(i) restrained', '(ii) improved', '(ii) faltered', '(ii) stabilized'],
                correct_answer: [1, 4],
                explanation: 'Ambition over logic suggests excess. "Unbridled" (uncontrolled) ambition led to a merger that "faltered" (weakened) in performance.',
                difficulty: 'hard'
            },
            {
                content: 'The witness\'s (i)_______ testimony, changing key details with each retelling, ultimately (ii)_______ rather than helped the prosecution\'s case.',
                type: 'double_blank',
                options: ['(i) consistent', '(i) inconsistent', '(i) reliable', '(ii) strengthened', '(ii) undermined', '(ii) supported'],
                correct_answer: [1, 4],
                explanation: 'Changing details indicates "inconsistent" testimony. This "undermined" (weakened) the prosecution rather than helping.',
                difficulty: 'easy'
            }
        ]
    }
];

// ============================================================================
// TRIPLE BLANKS - Tests 3 & 4
// ============================================================================
const tripleBlankTests = [
    {
        title: 'Triple Blanks - Test 3',
        category: 'Triple Blanks',
        description: 'Practice three-blank completion requiring logical coherence.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The scientist\'s (i)_______ claims about her discovery were met with (ii)_______ from colleagues who demanded rigorous evidence before they would (iii)_______ such revolutionary assertions.',
                type: 'triple_blank',
                options: ['(i) modest', '(i) extraordinary', '(i) conventional', '(ii) acceptance', '(ii) skepticism', '(ii) enthusiasm', '(iii) reject', '(iii) accept', '(iii) ignore'],
                correct_answer: [1, 4, 7],
                explanation: 'Revolutionary claims need evidence. "Extraordinary" claims met "skepticism" from colleagues who wouldn\'t "accept" them without proof.',
                difficulty: 'easy'
            },
            {
                content: 'The politician\'s speech was carefully (i)_______ to appeal to moderates; however, this attempt at (ii)_______ alienated her base, who felt she had (iii)_______ her principles.',
                type: 'triple_blank',
                options: ['(i) crafted', '(i) improvised', '(i) ignored', '(ii) polarization', '(ii) moderation', '(ii) extremism', '(iii) upheld', '(iii) abandoned', '(iii) strengthened'],
                correct_answer: [0, 4, 7],
                explanation: 'Appealing to moderates requires careful planning. Speech was "crafted" for "moderation," but this made the base feel she "abandoned" her principles.',
                difficulty: 'medium'
            },
            {
                content: 'The novel\'s (i)_______ narrative structure, which jumps between timelines, can initially (ii)_______ readers but ultimately (iii)_______ those who persist with a richly layered story.',
                type: 'triple_blank',
                options: ['(i) linear', '(i) nonlinear', '(i) simple', '(ii) engage', '(ii) confuse', '(ii) bore', '(iii) disappoints', '(iii) rewards', '(iii) frustrates'],
                correct_answer: [1, 4, 7],
                explanation: 'Jumping between timelines is "nonlinear." This initially "confuses" readers but "rewards" persistent ones.',
                difficulty: 'easy'
            },
            {
                content: 'The CEO\'s (i)_______ leadership during the crisis—making decisions without consulting her team—was seen by some as necessary (ii)_______ and by others as dangerous (iii)_______.',
                type: 'triple_blank',
                options: ['(i) collaborative', '(i) autocratic', '(i) democratic', '(ii) indecision', '(ii) decisiveness', '(ii) hesitation', '(iii) consultation', '(iii) overreach', '(iii) caution'],
                correct_answer: [1, 4, 7],
                explanation: 'Deciding without consulting is "autocratic." Some saw it as necessary "decisiveness"; others as dangerous "overreach."',
                difficulty: 'medium'
            },
            {
                content: 'The research was (i)_______ in its scope, examining data from dozens of countries; this (ii)_______ approach ensured that the findings would be (iii)_______ across different cultural contexts.',
                type: 'triple_blank',
                options: ['(i) narrow', '(i) comprehensive', '(i) limited', '(ii) restricted', '(ii) broad', '(ii) focused', '(iii) invalid', '(iii) applicable', '(iii) irrelevant'],
                correct_answer: [1, 4, 7],
                explanation: 'Examining dozens of countries shows breadth. "Comprehensive" scope with a "broad" approach ensures findings are "applicable" across cultures.',
                difficulty: 'easy'
            },
            {
                content: 'The reformer\'s ideas, considered (i)_______ in her own time, have since become so (ii)_______ that we forget how (iii)_______ they once seemed.',
                type: 'triple_blank',
                options: ['(i) mainstream', '(i) radical', '(i) conventional', '(ii) controversial', '(ii) commonplace', '(ii) rejected', '(iii) ordinary', '(iii) revolutionary', '(iii) acceptable'],
                correct_answer: [1, 4, 7],
                explanation: 'Ideas that changed from controversial to accepted. Once "radical," now "commonplace," we forget how "revolutionary" they seemed.',
                difficulty: 'hard'
            },
            {
                content: 'The documentary\'s (i)_______ of the historical figure, though praised for its (ii)_______, has been criticized for (iii)_______ certain unflattering aspects of his life.',
                type: 'triple_blank',
                options: ['(i) criticism', '(i) portrayal', '(i) condemnation', '(ii) bias', '(ii) thoroughness', '(ii) superficiality', '(iii) emphasizing', '(iii) omitting', '(iii) exploring'],
                correct_answer: [1, 4, 7],
                explanation: 'A documentary depicts someone. The "portrayal" was praised for "thoroughness" but criticized for "omitting" (leaving out) unflattering aspects.',
                difficulty: 'medium'
            },
            {
                content: 'The technology\'s (i)_______ potential was recognized by only a few visionaries; most investors dismissed it as (ii)_______, failing to anticipate how it would (iii)_______ entire industries.',
                type: 'triple_blank',
                options: ['(i) limited', '(i) transformative', '(i) modest', '(ii) promising', '(ii) impractical', '(ii) revolutionary', '(iii) preserve', '(iii) disrupt', '(iii) support'],
                correct_answer: [1, 4, 7],
                explanation: 'Visionaries saw potential others missed. "Transformative" potential dismissed as "impractical," but it would "disrupt" (radically change) industries.',
                difficulty: 'hard'
            },
            {
                content: 'The author\'s (i)_______ style, characterized by long, complex sentences, can be (ii)_______ for casual readers but deeply (iii)_______ for those willing to engage with its intricacies.',
                type: 'triple_blank',
                options: ['(i) simple', '(i) demanding', '(i) accessible', '(ii) appealing', '(ii) challenging', '(ii) refreshing', '(iii) disappointing', '(iii) rewarding', '(iii) frustrating'],
                correct_answer: [1, 4, 7],
                explanation: 'Long, complex sentences are "demanding." This is "challenging" for casual readers but "rewarding" for engaged ones.',
                difficulty: 'medium'
            },
            {
                content: 'The treaty\'s (i)_______ language allowed each nation to interpret its obligations differently, which initially prevented (ii)_______ but eventually led to (iii)_______ when disputes arose.',
                type: 'triple_blank',
                options: ['(i) precise', '(i) vague', '(i) clear', '(ii) agreement', '(ii) conflict', '(ii) cooperation', '(iii) resolution', '(iii) confusion', '(iii) harmony'],
                correct_answer: [1, 4, 7],
                explanation: 'Different interpretations suggest unclear wording. "Vague" language prevented "conflict" initially but caused "confusion" during disputes.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Triple Blanks - Test 4',
        category: 'Triple Blanks',
        description: 'Challenging three-blank questions with sophisticated vocabulary.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The philosopher\'s work, though (i)_______ during his lifetime, has experienced a (ii)_______ in recent decades as scholars have come to (iii)_______ its relevance to contemporary debates.',
                type: 'triple_blank',
                options: ['(i) celebrated', '(i) neglected', '(i) popular', '(ii) decline', '(ii) revival', '(ii) setback', '(iii) question', '(iii) appreciate', '(iii) doubt'],
                correct_answer: [1, 4, 7],
                explanation: 'Work becoming relevant suggests previous obscurity. "Neglected" during his life, now experiencing a "revival" as scholars "appreciate" its relevance.',
                difficulty: 'easy'
            },
            {
                content: 'The company\'s (i)_______ expansion strategy, entering new markets without adequate research, resulted in (ii)_______ losses that ultimately (iii)_______ its financial stability.',
                type: 'triple_blank',
                options: ['(i) cautious', '(i) reckless', '(i) measured', '(ii) modest', '(ii) substantial', '(ii) minimal', '(iii) reinforced', '(iii) threatened', '(iii) ensured'],
                correct_answer: [1, 4, 7],
                explanation: 'Inadequate research suggests poor planning. "Reckless" expansion caused "substantial" losses that "threatened" stability.',
                difficulty: 'medium'
            },
            {
                content: 'The artist\'s (i)_______ from the art world, lasting nearly a decade, made her subsequent (ii)_______ all the more remarkable; critics who had once dismissed her work now (iii)_______ her as a genius.',
                type: 'triple_blank',
                options: ['(i) emergence', '(i) absence', '(i) dominance', '(ii) failure', '(ii) comeback', '(ii) departure', '(iii) criticized', '(iii) hailed', '(iii) ignored'],
                correct_answer: [1, 4, 7],
                explanation: 'A decade away followed by return. "Absence" made the "comeback" remarkable; critics now "hailed" (praised) her as genius.',
                difficulty: 'medium'
            },
            {
                content: 'The policy was designed to (i)_______ economic inequality; however, its implementation was so (ii)_______ that it actually (iii)_______ the very disparities it sought to address.',
                type: 'triple_blank',
                options: ['(i) increase', '(i) reduce', '(i) maintain', '(ii) effective', '(ii) flawed', '(ii) successful', '(iii) eliminated', '(iii) exacerbated', '(iii) resolved'],
                correct_answer: [1, 4, 7],
                explanation: 'Policy had opposite effect from intention. Designed to "reduce" inequality, "flawed" implementation "exacerbated" (worsened) disparities.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s early work displayed (i)_______ promise, but years of commercial success led to a certain (ii)_______ in her later books, which many critics found (iii)_______ compared to her debut.',
                type: 'triple_blank',
                options: ['(i) little', '(i) considerable', '(i) modest', '(ii) innovation', '(ii) complacency', '(ii) improvement', '(iii) superior', '(iii) disappointing', '(iii) impressive'],
                correct_answer: [1, 4, 7],
                explanation: 'Early promise not fulfilled later. "Considerable" early promise, later "complacency" (self-satisfaction), books became "disappointing" compared to debut.',
                difficulty: 'hard'
            },
            {
                content: 'The witness\'s testimony was (i)_______ at key points, leading the jury to (ii)_______ her account; this (iii)_______ ultimately influenced the verdict.',
                type: 'triple_blank',
                options: ['(i) consistent', '(i) contradictory', '(i) clear', '(ii) accept', '(ii) doubt', '(ii) ignore', '(iii) clarity', '(iii) credibility gap', '(iii) agreement'],
                correct_answer: [1, 4, 7],
                explanation: 'Inconsistent testimony causes problems. "Contradictory" testimony made jury "doubt" her account; this "credibility gap" influenced the verdict.',
                difficulty: 'medium'
            },
            {
                content: 'The regime\'s (i)_______ of dissent created an atmosphere of fear in which citizens learned to (ii)_______ their true opinions, expressing only (iii)_______ agreement with official policies.',
                type: 'triple_blank',
                options: ['(i) tolerance', '(i) suppression', '(i) encouragement', '(ii) express', '(ii) conceal', '(ii) share', '(iii) sincere', '(iii) feigned', '(iii) genuine'],
                correct_answer: [1, 4, 7],
                explanation: 'Fear of dissent causes self-censorship. "Suppression" of dissent made citizens "conceal" opinions, expressing only "feigned" (fake) agreement.',
                difficulty: 'hard'
            },
            {
                content: 'The theory\'s (i)_______ elegance appealed to theorists, but experimentalists found it (ii)_______ to test; this gap between theory and practice remained (iii)_______ for decades.',
                type: 'triple_blank',
                options: ['(i) mathematical', '(i) practical', '(i) experimental', '(ii) easy', '(ii) difficult', '(ii) straightforward', '(iii) resolved', '(iii) unresolved', '(iii) closed'],
                correct_answer: [0, 4, 7],
                explanation: 'Beautiful theory hard to verify. "Mathematical" elegance appealed to theorists but was "difficult" to test; the gap remained "unresolved."',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s (i)_______ manner, which colleagues mistook for (ii)_______, actually masked a sharp strategic mind that consistently (iii)_______ its adversaries.',
                type: 'triple_blank',
                options: ['(i) aggressive', '(i) unassuming', '(i) intimidating', '(ii) brilliance', '(ii) weakness', '(ii) strength', '(iii) assisted', '(iii) outmaneuvered', '(iii) supported'],
                correct_answer: [1, 4, 7],
                explanation: 'Appearance deceived colleagues. "Unassuming" manner mistaken for "weakness" actually concealed a mind that "outmaneuvered" (outsmarted) adversaries.',
                difficulty: 'hard'
            },
            {
                content: 'The study\'s findings were (i)_______, challenging assumptions held for decades; naturally, this (ii)_______ conclusion was met with considerable (iii)_______ from established researchers.',
                type: 'triple_blank',
                options: ['(i) expected', '(i) surprising', '(i) predictable', '(ii) conventional', '(ii) controversial', '(ii) obvious', '(iii) support', '(iii) resistance', '(iii) enthusiasm'],
                correct_answer: [1, 4, 7],
                explanation: 'Challenging assumptions is unexpected. "Surprising" findings were "controversial" and met with "resistance" from the establishment.',
                difficulty: 'easy'
            }
        ]
    }
];

// ============================================================================
// SENTENCE EQUIVALENCE - Tests 3 & 4
// ============================================================================
const sentenceEquivalenceTests = [
    {
        title: 'Sentence Equivalence - Test 3',
        category: 'Sentence Equivalence',
        description: 'Select two answers creating sentences with equivalent meanings.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The explorer\'s journal entries became increasingly _______ as supplies dwindled and hope faded.',
                type: 'sentence_equivalence',
                options: ['optimistic', 'despondent', 'cheerful', 'morose', 'upbeat', 'enthusiastic'],
                correct_answer: [1, 3],
                explanation: 'Dwindling supplies and fading hope suggest depression. "Despondent" and "morose" both mean gloomy or dejected. The other options suggest positive moods.',
                difficulty: 'easy'
            },
            {
                content: 'The committee\'s _______ review of the proposal failed to identify several critical flaws.',
                type: 'sentence_equivalence',
                options: ['thorough', 'perfunctory', 'exhaustive', 'cursory', 'meticulous', 'comprehensive'],
                correct_answer: [1, 3],
                explanation: 'Failing to identify flaws suggests inadequate review. "Perfunctory" and "cursory" both mean hasty and superficial. The other options suggest thoroughness.',
                difficulty: 'medium'
            },
            {
                content: 'The novelist\'s latest work has been praised for its _______ portrayal of small-town life.',
                type: 'sentence_equivalence',
                options: ['distorted', 'authentic', 'exaggerated', 'genuine', 'false', 'misleading'],
                correct_answer: [1, 3],
                explanation: 'Praised portrayal suggests accuracy. "Authentic" and "genuine" both mean real and true to life. The other options suggest inaccuracy.',
                difficulty: 'easy'
            },
            {
                content: 'The professor\'s _______ explanation left students more confused than before.',
                type: 'sentence_equivalence',
                options: ['lucid', 'convoluted', 'clear', 'tortuous', 'straightforward', 'simple'],
                correct_answer: [1, 3],
                explanation: 'Causing confusion suggests unclear explanation. "Convoluted" and "tortuous" both mean complicated and twisted. The other options suggest clarity.',
                difficulty: 'medium'
            },
            {
                content: 'The artist was known for her _______ lifestyle, shunning material possessions and living simply.',
                type: 'sentence_equivalence',
                options: ['lavish', 'ascetic', 'extravagant', 'austere', 'luxurious', 'opulent'],
                correct_answer: [1, 3],
                explanation: 'Shunning possessions and living simply indicates self-denial. "Ascetic" and "austere" both mean severely simple and self-disciplined. The other options suggest luxury.',
                difficulty: 'hard'
            },
            {
                content: 'The witness\'s _______ account of the accident contradicted the physical evidence at the scene.',
                type: 'sentence_equivalence',
                options: ['accurate', 'dubious', 'reliable', 'questionable', 'trustworthy', 'credible'],
                correct_answer: [1, 3],
                explanation: 'Contradicting evidence suggests unreliability. "Dubious" and "questionable" both mean doubtful or uncertain. The other options suggest trustworthiness.',
                difficulty: 'easy'
            },
            {
                content: 'The new employee\'s _______ behavior quickly alienated her colleagues.',
                type: 'sentence_equivalence',
                options: ['modest', 'supercilious', 'humble', 'haughty', 'unassuming', 'diffident'],
                correct_answer: [1, 3],
                explanation: 'Alienating colleagues suggests arrogance. "Supercilious" and "haughty" both mean showing superiority and disdain. The other options suggest humility.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s _______ remarks about the tragedy drew widespread condemnation.',
                type: 'sentence_equivalence',
                options: ['compassionate', 'callous', 'sympathetic', 'insensitive', 'caring', 'tender'],
                correct_answer: [1, 3],
                explanation: 'Drawing condemnation suggests inappropriate remarks. "Callous" and "insensitive" both mean showing disregard for others\' feelings. The other options suggest empathy.',
                difficulty: 'easy'
            },
            {
                content: 'The manuscript\'s _______ handwriting made it nearly impossible to decipher.',
                type: 'sentence_equivalence',
                options: ['legible', 'illegible', 'clear', 'indecipherable', 'readable', 'neat'],
                correct_answer: [1, 3],
                explanation: 'Being nearly impossible to decipher means unreadable. "Illegible" and "indecipherable" both mean impossible to read. The other options suggest readability.',
                difficulty: 'easy'
            },
            {
                content: 'The CEO\'s _______ response to the crisis reassured stakeholders who had feared panic.',
                type: 'sentence_equivalence',
                options: ['frantic', 'measured', 'hysterical', 'composed', 'agitated', 'panicked'],
                correct_answer: [1, 3],
                explanation: 'Reassuring stakeholders who feared panic suggests calmness. "Measured" and "composed" both mean calm and controlled. The other options suggest anxiety.',
                difficulty: 'medium'
            }
        ]
    },
    {
        title: 'Sentence Equivalence - Test 4',
        category: 'Sentence Equivalence',
        description: 'Advanced synonym pair identification in context.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The comedian\'s _______ humor often made audiences uncomfortable, pushing boundaries that many felt should not be crossed.',
                type: 'sentence_equivalence',
                options: ['gentle', 'edgy', 'mild', 'provocative', 'tame', 'inoffensive'],
                correct_answer: [1, 3],
                explanation: 'Making audiences uncomfortable by pushing boundaries suggests challenging content. "Edgy" and "provocative" both mean deliberately controversial. The other options suggest safe content.',
                difficulty: 'easy'
            },
            {
                content: 'The scientist\'s _______ claims about her discovery raised eyebrows among colleagues who demanded evidence.',
                type: 'sentence_equivalence',
                options: ['modest', 'grandiose', 'humble', 'extravagant', 'understated', 'conservative'],
                correct_answer: [1, 3],
                explanation: 'Claims raising eyebrows and demanding evidence suggests excessive assertions. "Grandiose" and "extravagant" both mean excessively ambitious. The other options suggest restraint.',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s _______ negotiating style wore down opponents who expected quick resolution.',
                type: 'sentence_equivalence',
                options: ['swift', 'protracted', 'rapid', 'prolonged', 'brief', 'expeditious'],
                correct_answer: [1, 3],
                explanation: 'Wearing down opponents expecting quick resolution suggests slowness. "Protracted" and "prolonged" both mean extended over time. The other options suggest speed.',
                difficulty: 'medium'
            },
            {
                content: 'The author\'s _______ prose style, using ten words where one would suffice, tested readers\' patience.',
                type: 'sentence_equivalence',
                options: ['concise', 'verbose', 'terse', 'prolix', 'succinct', 'economical'],
                correct_answer: [1, 3],
                explanation: 'Using excessive words tests patience. "Verbose" and "prolix" both mean using too many words. The other options suggest brevity.',
                difficulty: 'hard'
            },
            {
                content: 'The evidence for the theory remains _______, neither conclusively proving nor disproving the hypothesis.',
                type: 'sentence_equivalence',
                options: ['definitive', 'equivocal', 'conclusive', 'ambiguous', 'certain', 'clear'],
                correct_answer: [1, 3],
                explanation: 'Neither proving nor disproving suggests uncertainty. "Equivocal" and "ambiguous" both mean open to multiple interpretations. The other options suggest certainty.',
                difficulty: 'medium'
            },
            {
                content: 'The critic\'s _______ review praised every aspect of the performance without reservation.',
                type: 'sentence_equivalence',
                options: ['lukewarm', 'effusive', 'tepid', 'gushing', 'restrained', 'measured'],
                correct_answer: [1, 3],
                explanation: 'Praising everything without reservation suggests enthusiastic approval. "Effusive" and "gushing" both mean expressing feelings freely and excessively. The other options suggest restraint.',
                difficulty: 'hard'
            },
            {
                content: 'The child\'s _______ behavior during the ceremony drew disapproving looks from the adults present.',
                type: 'sentence_equivalence',
                options: ['decorous', 'unruly', 'proper', 'boisterous', 'dignified', 'appropriate'],
                correct_answer: [1, 3],
                explanation: 'Drawing disapproving looks suggests inappropriate behavior. "Unruly" and "boisterous" both mean noisy and lacking discipline. The other options suggest proper behavior.',
                difficulty: 'easy'
            },
            {
                content: 'The investment\'s returns proved _______, falling far short of the projections that had attracted investors.',
                type: 'sentence_equivalence',
                options: ['impressive', 'meager', 'substantial', 'paltry', 'generous', 'abundant'],
                correct_answer: [1, 3],
                explanation: 'Falling far short of projections suggests inadequate returns. "Meager" and "paltry" both mean inadequately small. The other options suggest substantial amounts.',
                difficulty: 'medium'
            },
            {
                content: 'The professor\'s _______ demeanor put students at ease during the notoriously difficult oral examinations.',
                type: 'sentence_equivalence',
                options: ['intimidating', 'affable', 'forbidding', 'genial', 'stern', 'severe'],
                correct_answer: [1, 3],
                explanation: 'Putting students at ease suggests friendliness. "Affable" and "genial" both mean friendly and good-natured. The other options suggest unfriendliness.',
                difficulty: 'medium'
            },
            {
                content: 'The treaty\'s _______ terms bound the defeated nation to decades of crippling payments.',
                type: 'sentence_equivalence',
                options: ['lenient', 'punitive', 'generous', 'harsh', 'forgiving', 'merciful'],
                correct_answer: [1, 3],
                explanation: 'Crippling payments suggest severity. "Punitive" and "harsh" both mean inflicting punishment or hardship. The other options suggest leniency.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// READING COMPREHENSION - Tests 3 & 4
// ============================================================================
const readingCompTests = [
    {
        title: 'Reading Comprehension - Test 3',
        category: 'Reading Comprehension',
        description: 'Practice analyzing academic passages for meaning and inference.',
        time_limit_minutes: 20,
        questions: [
            {
                content: `PASSAGE: The relationship between sleep and memory consolidation has been a subject of intense scientific inquiry. During sleep, particularly during the deep stages known as slow-wave sleep, the brain appears to replay and strengthen neural connections formed during waking hours. This process, researchers believe, transforms fragile short-term memories into more stable long-term ones. However, not all memories benefit equally from sleep. Studies suggest that emotionally significant memories are preferentially consolidated, possibly because the amygdala, which processes emotions, remains active during certain sleep stages. This selectivity may have evolved because remembering emotionally charged events—whether threats or opportunities—was more critical for survival than recalling neutral information.

QUESTION: According to the passage, which of the following is true about memory consolidation during sleep?`,
                type: 'single_choice',
                options: [
                    'All memories are strengthened equally during sleep',
                    'Only neutral memories are consolidated during sleep',
                    'Emotionally significant memories receive preferential treatment',
                    'The amygdala is inactive during all sleep stages',
                    'Short-term memories cannot become long-term memories'
                ],
                correct_answer: [2],
                explanation: 'The passage states that "emotionally significant memories are preferentially consolidated" and explains the amygdala\'s role in this process.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The relationship between sleep and memory consolidation has been a subject of intense scientific inquiry. During sleep, particularly during the deep stages known as slow-wave sleep, the brain appears to replay and strengthen neural connections formed during waking hours. This process, researchers believe, transforms fragile short-term memories into more stable long-term ones. However, not all memories benefit equally from sleep. Studies suggest that emotionally significant memories are preferentially consolidated, possibly because the amygdala, which processes emotions, remains active during certain sleep stages. This selectivity may have evolved because remembering emotionally charged events—whether threats or opportunities—was more critical for survival than recalling neutral information.

QUESTION: The passage suggests that the selective consolidation of emotional memories`,
                type: 'single_choice',
                options: [
                    'is a flaw in human cognition',
                    'occurs only during waking hours',
                    'may have provided an evolutionary advantage',
                    'prevents the consolidation of neutral memories',
                    'has only recently developed in humans'
                ],
                correct_answer: [2],
                explanation: 'The passage states this selectivity "may have evolved because remembering emotionally charged events...was more critical for survival," suggesting an evolutionary advantage.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Urban heat islands—metropolitan areas significantly warmer than surrounding rural regions—pose increasing health risks as cities grow and climate change intensifies. The temperature differential, which can exceed 5°C, results from multiple factors: dark surfaces like asphalt absorb more solar radiation than vegetation; buildings trap heat and block cooling winds; and human activities generate additional warmth. The consequences extend beyond discomfort. Heat islands increase energy consumption as residents rely more heavily on air conditioning, creating a feedback loop that generates more waste heat and greenhouse gas emissions. More critically, extreme heat events in urban areas disproportionately affect vulnerable populations—the elderly, the poor, and those with pre-existing health conditions—who may lack access to cooling resources.

QUESTION: Which of the following best describes the "feedback loop" mentioned in the passage?`,
                type: 'single_choice',
                options: [
                    'Rural areas becoming warmer than urban areas',
                    'Increased air conditioning leading to more heat and emissions',
                    'Vegetation reducing urban temperatures',
                    'Poor populations moving to rural areas',
                    'Buildings blocking winds that cool the city'
                ],
                correct_answer: [1],
                explanation: 'The passage describes the feedback loop as: heat islands increase energy consumption (air conditioning), which "generates more waste heat and greenhouse gas emissions," worsening the problem.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: Urban heat islands—metropolitan areas significantly warmer than surrounding rural regions—pose increasing health risks as cities grow and climate change intensifies. The temperature differential, which can exceed 5°C, results from multiple factors: dark surfaces like asphalt absorb more solar radiation than vegetation; buildings trap heat and block cooling winds; and human activities generate additional warmth. The consequences extend beyond discomfort. Heat islands increase energy consumption as residents rely more heavily on air conditioning, creating a feedback loop that generates more waste heat and greenhouse gas emissions. More critically, extreme heat events in urban areas disproportionately affect vulnerable populations—the elderly, the poor, and those with pre-existing health conditions—who may lack access to cooling resources.

QUESTION: The passage implies that urban heat islands are particularly concerning because they`,
                type: 'single_choice',
                options: [
                    'affect all urban residents equally',
                    'are decreasing in intensity over time',
                    'have no impact on energy consumption',
                    'create conditions that can worsen existing inequalities',
                    'only affect cities in tropical climates'
                ],
                correct_answer: [3],
                explanation: 'The passage states heat events "disproportionately affect vulnerable populations" who "may lack access to cooling resources," indicating that existing inequalities are worsened.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The decline of coral reefs worldwide has prompted scientists to explore controversial intervention strategies. One approach involves transplanting heat-resistant coral species from naturally warmer waters to threatened reefs. Proponents argue that such "assisted migration" could buy time for ecosystems to adapt naturally. Critics counter that introducing non-native species risks disrupting delicate ecological balances and could introduce diseases. A more radical proposal involves genetic modification to enhance corals' heat tolerance. While laboratory results have been promising, scaling such interventions to the vast expanses of ocean reef systems presents formidable challenges, both technical and financial. Perhaps most fundamentally, some ecologists question whether such technological fixes address the root cause—greenhouse gas emissions—or merely provide a false sense of progress while the underlying problem worsens.

QUESTION: According to the passage, what is the primary concern ecologists have about technological interventions for coral reefs?`,
                type: 'single_choice',
                options: [
                    'They are too expensive to implement',
                    'They have never been tested in laboratories',
                    'They may distract from addressing the fundamental problem',
                    'They have been proven ineffective',
                    'They only work in tropical waters'
                ],
                correct_answer: [2],
                explanation: 'The passage states ecologists question whether such fixes "address the root cause—greenhouse gas emissions—or merely provide a false sense of progress while the underlying problem worsens."',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The decline of coral reefs worldwide has prompted scientists to explore controversial intervention strategies. One approach involves transplanting heat-resistant coral species from naturally warmer waters to threatened reefs. Proponents argue that such "assisted migration" could buy time for ecosystems to adapt naturally. Critics counter that introducing non-native species risks disrupting delicate ecological balances and could introduce diseases. A more radical proposal involves genetic modification to enhance corals' heat tolerance. While laboratory results have been promising, scaling such interventions to the vast expanses of ocean reef systems presents formidable challenges, both technical and financial. Perhaps most fundamentally, some ecologists question whether such technological fixes address the root cause—greenhouse gas emissions—or merely provide a false sense of progress while the underlying problem worsens.

QUESTION: The author's presentation of coral reef intervention strategies can best be described as`,
                type: 'single_choice',
                options: [
                    'enthusiastically supportive',
                    'dismissively critical',
                    'objectively balanced, presenting multiple perspectives',
                    'focused exclusively on benefits',
                    'emotionally charged and one-sided'
                ],
                correct_answer: [2],
                explanation: 'The author presents "proponents" views, "critics" concerns, and ecologists\' fundamental questions, giving a balanced view of different perspectives without clearly favoring one.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The concept of "nudging"—using subtle environmental changes to influence behavior without restricting choices—has become increasingly popular among policymakers. Classic examples include placing healthy foods at eye level in cafeterias or making organ donation the default option that requires opting out rather than in. Proponents celebrate nudges as a way to promote beneficial behaviors while respecting individual autonomy. However, critics raise both practical and ethical concerns. Some studies suggest that nudge effects are often small and may not persist over time. More troublingly, if people can be nudged toward beneficial behaviors, they can presumably be nudged toward harmful ones as well. This raises questions about who decides what constitutes beneficial behavior and whether even well-intentioned manipulation undermines the authentic choice that autonomy supposedly protects.

QUESTION: Based on the passage, which of the following would proponents of nudging most likely argue?`,
                type: 'single_choice',
                options: [
                    'Nudges should replace all traditional regulations',
                    'People cannot make good decisions without nudges',
                    'Nudges can improve outcomes without eliminating freedom',
                    'Nudge effects are always permanent and significant',
                    'Only government agencies should be allowed to use nudges'
                ],
                correct_answer: [2],
                explanation: 'The passage states proponents "celebrate nudges as a way to promote beneficial behaviors while respecting individual autonomy"—improving outcomes without restricting choice.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The concept of "nudging"—using subtle environmental changes to influence behavior without restricting choices—has become increasingly popular among policymakers. Classic examples include placing healthy foods at eye level in cafeterias or making organ donation the default option that requires opting out rather than in. Proponents celebrate nudges as a way to promote beneficial behaviors while respecting individual autonomy. However, critics raise both practical and ethical concerns. Some studies suggest that nudge effects are often small and may not persist over time. More troublingly, if people can be nudged toward beneficial behaviors, they can presumably be nudged toward harmful ones as well. This raises questions about who decides what constitutes beneficial behavior and whether even well-intentioned manipulation undermines the authentic choice that autonomy supposedly protects.

QUESTION: The passage identifies which of the following as an ethical concern about nudging?`,
                type: 'single_choice',
                options: [
                    'Nudges are too expensive to implement effectively',
                    'The same techniques could be used for harmful purposes',
                    'Nudges only work in cafeteria settings',
                    'People always notice when they are being nudged',
                    'Nudges require too much government oversight'
                ],
                correct_answer: [1],
                explanation: 'The passage states "if people can be nudged toward beneficial behaviors, they can presumably be nudged toward harmful ones as well"—the same manipulation techniques could serve harmful purposes.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: Recent research has challenged the traditional view of the Roman Empire's fall as a sudden catastrophe caused by barbarian invasions. Archaeological evidence suggests that in many regions, the transition from Roman to post-Roman society was gradual and complex. Trade networks, while diminished, continued to function; many Roman administrative practices persisted under new rulers; and populations in some areas increased rather than declined. This revisionist perspective does not deny that significant changes occurred—the end of centralized authority, the contraction of long-distance trade, and the simplification of material culture are well documented. Rather, it argues that characterizing this period as a "collapse" obscures important continuities and imposes a misleadingly dramatic narrative on a more nuanced historical reality.

QUESTION: The revisionist perspective described in the passage differs from traditional views primarily in its emphasis on`,
                type: 'single_choice',
                options: [
                    'the role of barbarian invasions',
                    'continuity alongside change during the transition',
                    'the complete absence of any disruption',
                    'economic growth throughout the period',
                    'the superiority of Roman civilization'
                ],
                correct_answer: [1],
                explanation: 'The passage states the revisionist view argues that calling it "collapse" "obscures important continuities." The revision emphasizes both changes occurred AND continuities existed.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Recent research has challenged the traditional view of the Roman Empire's fall as a sudden catastrophe caused by barbarian invasions. Archaeological evidence suggests that in many regions, the transition from Roman to post-Roman society was gradual and complex. Trade networks, while diminished, continued to function; many Roman administrative practices persisted under new rulers; and populations in some areas increased rather than declined. This revisionist perspective does not deny that significant changes occurred—the end of centralized authority, the contraction of long-distance trade, and the simplification of material culture are well documented. Rather, it argues that characterizing this period as a "collapse" obscures important continuities and imposes a misleadingly dramatic narrative on a more nuanced historical reality.

QUESTION: According to the passage, which of the following is acknowledged by the revisionist perspective?`,
                type: 'single_choice',
                options: [
                    'Barbarian invasions caused instant collapse',
                    'No significant changes occurred during this period',
                    'Centralized authority did end during this transition',
                    'Long-distance trade expanded during this period',
                    'Material culture became more sophisticated'
                ],
                correct_answer: [2],
                explanation: 'The passage states the revisionist view "does not deny that significant changes occurred—the end of centralized authority...are well documented." Revisionists accept this change happened.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Reading Comprehension - Test 4',
        category: 'Reading Comprehension',
        description: 'Complex passages testing inference and critical analysis.',
        time_limit_minutes: 20,
        questions: [
            {
                content: `PASSAGE: The placebo effect—improvement in patients who receive inert treatments—has long been considered a nuisance variable in clinical trials, something to be controlled for rather than studied. Recently, however, researchers have begun examining placebos as a phenomenon worthy of investigation in their own right. Brain imaging studies reveal that placebo treatments can trigger genuine physiological changes, including the release of endorphins and dopamine. These findings have led some researchers to propose "open-label" placebos, where patients are explicitly told they are receiving a placebo yet still experience benefits. While this approach raises intriguing possibilities for treatment, it also presents ethical complexities. If placebos work through patients' expectations, does deceiving patients enhance outcomes? And if open-label placebos are effective, what does this suggest about the nature of healing and the doctor-patient relationship?

QUESTION: The passage suggests that the traditional view of placebos in clinical trials was that they`,
                type: 'single_choice',
                options: [
                    'produced important therapeutic effects',
                    'were a complication to be eliminated from analysis',
                    'should be given to all patients',
                    'caused harmful side effects',
                    'were more effective than active treatments'
                ],
                correct_answer: [1],
                explanation: 'The passage states placebos were "considered a nuisance variable in clinical trials, something to be controlled for rather than studied"—a complication to manage.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The placebo effect—improvement in patients who receive inert treatments—has long been considered a nuisance variable in clinical trials, something to be controlled for rather than studied. Recently, however, researchers have begun examining placebos as a phenomenon worthy of investigation in their own right. Brain imaging studies reveal that placebo treatments can trigger genuine physiological changes, including the release of endorphins and dopamine. These findings have led some researchers to propose "open-label" placebos, where patients are explicitly told they are receiving a placebo yet still experience benefits. While this approach raises intriguing possibilities for treatment, it also presents ethical complexities. If placebos work through patients' expectations, does deceiving patients enhance outcomes? And if open-label placebos are effective, what does this suggest about the nature of healing and the doctor-patient relationship?

QUESTION: The brain imaging findings mentioned in the passage are significant primarily because they`,
                type: 'single_choice',
                options: [
                    'prove that all medications work through the placebo effect',
                    'demonstrate that placebo responses involve real biological changes',
                    'show that placebos are more effective than active drugs',
                    'indicate that brain imaging should replace clinical trials',
                    'reveal that patients always know when they receive placebos'
                ],
                correct_answer: [1],
                explanation: 'The passage states brain imaging shows "placebo treatments can trigger genuine physiological changes," demonstrating the effects are biologically real, not just subjective.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The development of writing systems transformed human civilization in ways that extended far beyond the simple recording of speech. Writing enabled the accumulation of knowledge across generations, freed from the limitations of individual memory. It made possible complex bureaucracies, legal codes, and systematic scholarship. Yet writing also introduced new forms of inequality. Literacy was typically restricted to elite classes—priests, scribes, administrators—who used their monopoly on written knowledge to consolidate power. The democratization of literacy that eventually followed the printing press did not eliminate these disparities but transformed them. Today, even in societies with near-universal basic literacy, disparities in advanced literacy skills—the ability to critically evaluate complex texts—continue to track closely with socioeconomic status.

QUESTION: According to the passage, writing systems contributed to inequality by`,
                type: 'single_choice',
                options: [
                    'making oral traditions obsolete',
                    'concentrating knowledge-related power among literate elites',
                    'preventing the development of legal codes',
                    'making bureaucracies impossible to maintain',
                    'reducing the total amount of human knowledge'
                ],
                correct_answer: [1],
                explanation: 'The passage states "Literacy was typically restricted to elite classes... who used their monopoly on written knowledge to consolidate power"—knowledge power concentrated among literates.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The development of writing systems transformed human civilization in ways that extended far beyond the simple recording of speech. Writing enabled the accumulation of knowledge across generations, freed from the limitations of individual memory. It made possible complex bureaucracies, legal codes, and systematic scholarship. Yet writing also introduced new forms of inequality. Literacy was typically restricted to elite classes—priests, scribes, administrators—who used their monopoly on written knowledge to consolidate power. The democratization of literacy that eventually followed the printing press did not eliminate these disparities but transformed them. Today, even in societies with near-universal basic literacy, disparities in advanced literacy skills—the ability to critically evaluate complex texts—continue to track closely with socioeconomic status.

QUESTION: The passage implies that the relationship between literacy and inequality`,
                type: 'single_choice',
                options: [
                    'ended completely with the invention of the printing press',
                    'has persisted but changed form over time',
                    'only existed in ancient civilizations',
                    'is no longer a concern in modern societies',
                    'was eliminated by universal basic education'
                ],
                correct_answer: [1],
                explanation: 'The passage traces inequality from early elite literacy through printing press democratization to modern "disparities in advanced literacy skills"—the relationship persisted but changed form.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The discovery of antibiotics in the twentieth century was hailed as one of medicine's greatest triumphs, transforming previously fatal infections into treatable conditions. Yet bacteria have proven remarkably adaptable. Through natural selection, resistant strains have emerged and spread, threatening to return us to a pre-antibiotic era where minor infections could once again prove deadly. The crisis has been exacerbated by misuse—overprescription for viral infections unaffected by antibiotics, and routine use in livestock to promote growth. Pharmaceutical companies, meanwhile, have largely abandoned antibiotic development, finding more profit in medications for chronic conditions that patients take for years rather than days. Addressing this complex problem will require coordinated action across medical practice, agriculture, and pharmaceutical economics—a challenging prospect in a world of competing interests and fragmented governance.

QUESTION: According to the passage, pharmaceutical companies have reduced antibiotic development primarily because`,
                type: 'single_choice',
                options: [
                    'antibiotics are too difficult to develop',
                    'bacterial resistance makes new antibiotics ineffective',
                    'chronic disease medications offer better financial returns',
                    'government regulations prohibit new antibiotic research',
                    'there is no longer any bacterial resistance'
                ],
                correct_answer: [2],
                explanation: 'The passage states companies find "more profit in medications for chronic conditions that patients take for years rather than days"—financial returns are better for chronic medications.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The discovery of antibiotics in the twentieth century was hailed as one of medicine's greatest triumphs, transforming previously fatal infections into treatable conditions. Yet bacteria have proven remarkably adaptable. Through natural selection, resistant strains have emerged and spread, threatening to return us to a pre-antibiotic era where minor infections could once again prove deadly. The crisis has been exacerbated by misuse—overprescription for viral infections unaffected by antibiotics, and routine use in livestock to promote growth. Pharmaceutical companies, meanwhile, have largely abandoned antibiotic development, finding more profit in medications for chronic conditions that patients take for years rather than days. Addressing this complex problem will require coordinated action across medical practice, agriculture, and pharmaceutical economics—a challenging prospect in a world of competing interests and fragmented governance.

QUESTION: The author suggests that solving the antibiotic resistance crisis is particularly difficult because`,
                type: 'single_choice',
                options: [
                    'scientists do not understand how bacteria develop resistance',
                    'there are no alternative treatments for bacterial infections',
                    'it requires cooperation across multiple sectors with different interests',
                    'patients refuse to take antibiotics as prescribed',
                    'antibiotics are no longer effective against any bacteria'
                ],
                correct_answer: [2],
                explanation: 'The passage states the solution "will require coordinated action across medical practice, agriculture, and pharmaceutical economics" but this is "challenging" due to "competing interests and fragmented governance."',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The emergence of social media has fundamentally altered how information spreads through society. Traditional media operated as gatekeepers, with editors and journalists filtering information before publication. Social media eliminates these intermediaries, allowing anyone to broadcast to potentially global audiences. Proponents celebrate this democratization of voice, noting that it has amplified marginalized perspectives and enabled rapid organization around social causes. Critics point to the proliferation of misinformation, the creation of echo chambers that reinforce existing beliefs, and the economic model that rewards engagement over accuracy. These platforms optimize for content that provokes strong emotional reactions—whether outrage, fear, or tribal solidarity—because such content keeps users scrolling and generates advertising revenue. The result, critics argue, is a public discourse increasingly shaped by algorithms designed to maximize engagement rather than inform.

QUESTION: According to the passage, traditional media differed from social media primarily in that traditional media`,
                type: 'single_choice',
                options: [
                    'reached larger audiences',
                    'was more profitable',
                    'filtered information before distribution',
                    'generated more emotional reactions',
                    'relied more heavily on advertising'
                ],
                correct_answer: [2],
                explanation: 'The passage states "Traditional media operated as gatekeepers, with editors and journalists filtering information before publication" whereas social media "eliminates these intermediaries."',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The emergence of social media has fundamentally altered how information spreads through society. Traditional media operated as gatekeepers, with editors and journalists filtering information before publication. Social media eliminates these intermediaries, allowing anyone to broadcast to potentially global audiences. Proponents celebrate this democratization of voice, noting that it has amplified marginalized perspectives and enabled rapid organization around social causes. Critics point to the proliferation of misinformation, the creation of echo chambers that reinforce existing beliefs, and the economic model that rewards engagement over accuracy. These platforms optimize for content that provokes strong emotional reactions—whether outrage, fear, or tribal solidarity—because such content keeps users scrolling and generates advertising revenue. The result, critics argue, is a public discourse increasingly shaped by algorithms designed to maximize engagement rather than inform.

QUESTION: The passage suggests that social media's economic model may harm public discourse because it`,
                type: 'single_choice',
                options: [
                    'makes advertising too expensive for most companies',
                    'prioritizes emotionally provocative content over accurate information',
                    'prevents marginalized voices from being heard',
                    'requires users to pay subscription fees',
                    'eliminates all forms of content moderation'
                ],
                correct_answer: [1],
                explanation: 'The passage states platforms "optimize for content that provokes strong emotional reactions" because it "keeps users scrolling and generates advertising revenue"—emotion over accuracy.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The concept of "invasive species" has come under scrutiny from some ecologists who question both its scientific basis and its practical implications. Traditional invasion biology treats non-native species as inherently problematic, focusing resources on eradication efforts. However, critics note that the distinction between native and non-native often depends on arbitrary historical cutoffs—usually the arrival of Europeans—that ignore the constant movement of species throughout ecological history. Moreover, some introduced species have become integral to their new ecosystems, providing food and habitat for native species. These ecologists argue for a more pragmatic approach that assesses species based on their ecological effects rather than their origin. This perspective remains controversial; many conservationists worry that abandoning the native/non-native distinction could provide cover for neglecting genuine ecological threats.

QUESTION: The critics of traditional invasion biology mentioned in the passage argue that`,
                type: 'single_choice',
                options: [
                    'all non-native species should be immediately eradicated',
                    'species should be evaluated by their impacts rather than origins',
                    'European colonization had no effect on ecosystems',
                    'native species are always more beneficial than non-native ones',
                    'conservation efforts should be completely abandoned'
                ],
                correct_answer: [1],
                explanation: 'The passage states critics "argue for a more pragmatic approach that assesses species based on their ecological effects rather than their origin."',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The concept of "invasive species" has come under scrutiny from some ecologists who question both its scientific basis and its practical implications. Traditional invasion biology treats non-native species as inherently problematic, focusing resources on eradication efforts. However, critics note that the distinction between native and non-native often depends on arbitrary historical cutoffs—usually the arrival of Europeans—that ignore the constant movement of species throughout ecological history. Moreover, some introduced species have become integral to their new ecosystems, providing food and habitat for native species. These ecologists argue for a more pragmatic approach that assesses species based on their ecological effects rather than their origin. This perspective remains controversial; many conservationists worry that abandoning the native/non-native distinction could provide cover for neglecting genuine ecological threats.

QUESTION: The concerns of "many conservationists" mentioned at the end of the passage suggest they fear that the critics' approach might`,
                type: 'single_choice',
                options: [
                    'be too strict in evaluating species',
                    'lead to inadequate responses to harmful species',
                    'require too many resources to implement',
                    'ignore the ecological effects of species',
                    'focus too much on European colonial history'
                ],
                correct_answer: [1],
                explanation: 'The passage states conservationists worry that abandoning the distinction "could provide cover for neglecting genuine ecological threats"—harmful species might not be addressed.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// WEAKENING - Tests 3 & 4
// ============================================================================
const weakeningTests = [
    {
        title: 'Weakening - Test 3',
        category: 'Weakening',
        description: 'Practice identifying flaws in logical arguments.',
        time_limit_minutes: 15,
        questions: [
            {
                content: `A school district argues that its new reading program is effective because students' test scores improved by 15% in the year after the program was implemented.

Which of the following, if true, would most weaken the school district's argument?`,
                type: 'single_choice',
                options: [
                    'The reading program was expensive to implement',
                    'Teachers received extensive training on the new program',
                    'The state also changed to an easier standardized test that year',
                    'Students reported enjoying the new reading materials',
                    'The improvement was consistent across all grade levels'
                ],
                correct_answer: [2],
                explanation: 'The argument assumes the program caused improvement. If the test became easier, the score improvement might reflect test change, not program effectiveness—an alternative explanation.',
                difficulty: 'easy'
            },
            {
                content: `A city official argues that the new bicycle lane network has reduced traffic congestion because average commute times decreased by 10% after the lanes were installed.

Which of the following, if true, would most weaken the official's argument?`,
                type: 'single_choice',
                options: [
                    'The bicycle lanes were built within the existing budget',
                    'A major employer relocated out of the city during the same period',
                    'Bicycle usage increased after the lanes were installed',
                    'The lanes connect residential areas with major employment centers',
                    'Similar bicycle lane projects have succeeded in other cities'
                ],
                correct_answer: [1],
                explanation: 'The argument links bicycle lanes to reduced commute times. If a major employer left, fewer people would be commuting, explaining the decrease without the lanes being responsible.',
                difficulty: 'medium'
            },
            {
                content: `A nutritionist argues that consuming breakfast leads to better academic performance because students who eat breakfast have higher GPAs than those who skip it.

Which of the following, if true, would most weaken the nutritionist's argument?`,
                type: 'single_choice',
                options: [
                    'Breakfast provides essential nutrients for brain function',
                    'Students who eat breakfast tend to come from families with more educational resources',
                    'The study surveyed thousands of students across many schools',
                    'Breakfast has been shown to improve concentration in laboratory settings',
                    'Many successful professionals report eating breakfast regularly'
                ],
                correct_answer: [1],
                explanation: 'The argument assumes breakfast causes better performance. If breakfast-eaters come from families with more educational resources, those resources (not breakfast) might explain the higher GPAs.',
                difficulty: 'medium'
            },
            {
                content: `A technology company claims that its new software increases worker productivity because departments using the software completed 20% more projects than before.

Which of the following, if true, would most weaken the company's claim?`,
                type: 'single_choice',
                options: [
                    'The software requires minimal training to use effectively',
                    'Departments that adopted the software also received additional staff',
                    'The software integrates with existing company systems',
                    'User satisfaction surveys show positive reviews of the software',
                    'The company has developed successful software products before'
                ],
                correct_answer: [1],
                explanation: 'The claim is that software increased productivity. If those departments also received more staff, the productivity increase could be due to additional workers, not the software.',
                difficulty: 'easy'
            },
            {
                content: `A pharmaceutical company argues that its pain medication is safer than competitors because fewer patients taking their drug reported side effects in clinical trials.

Which of the following, if true, would most weaken the company's argument?`,
                type: 'single_choice',
                options: [
                    'The medication is more expensive than competing drugs',
                    'The company\'s trial used younger, healthier participants than competitors\' trials',
                    'Doctors have prescribed the medication to thousands of patients',
                    'The medication comes in multiple dosage forms',
                    'The company conducted the trial at multiple research sites'
                ],
                correct_answer: [1],
                explanation: 'The argument compares side effect rates. If the company used healthier participants, their lower side effect rate might reflect participant selection, not drug safety—making the comparison invalid.',
                difficulty: 'hard'
            },
            {
                content: `An economist argues that reducing corporate tax rates will increase government revenue because two countries that cut corporate taxes subsequently saw tax revenues rise.

Which of the following, if true, would most weaken the economist's argument?`,
                type: 'single_choice',
                options: [
                    'The tax cuts were opposed by some political parties',
                    'Both countries experienced strong economic growth during this period due to other factors',
                    'Corporate tax rates vary widely among developed countries',
                    'Tax revenue increases are generally popular with voters',
                    'The economist has studied tax policy for many years'
                ],
                correct_answer: [1],
                explanation: 'The argument links tax cuts to revenue increases. If both countries had strong growth from other factors, that growth (not the tax cuts) likely caused the revenue increase.',
                difficulty: 'medium'
            },
            {
                content: `A fitness company claims that its workout program builds muscle more effectively than competitors because participants gained an average of 5 pounds of muscle in three months.

Which of the following, if true, would most weaken the company's claim?`,
                type: 'single_choice',
                options: [
                    'The program requires expensive equipment',
                    'Participants were also given free protein supplements not included in competitors\' programs',
                    'The program includes both strength training and cardio exercises',
                    'Many professional athletes use similar training techniques',
                    'The company offers a money-back guarantee'
                ],
                correct_answer: [1],
                explanation: 'The claim is about the workout program\'s effectiveness. If participants also received supplements not given by competitors, the muscle gain might be due to supplements, not the workout program.',
                difficulty: 'medium'
            },
            {
                content: `A mayor argues that the city's new community policing initiative has reduced crime because crime rates dropped 12% in the year after the initiative began.

Which of the following, if true, would most weaken the mayor's argument?`,
                type: 'single_choice',
                options: [
                    'The initiative was popular among residents',
                    'Crime rates also dropped by similar amounts in neighboring cities without such initiatives',
                    'Officers received special training for the community policing program',
                    'The initiative increased police presence in high-crime areas',
                    'Other cities have implemented similar successful programs'
                ],
                correct_answer: [1],
                explanation: 'The argument credits the initiative for crime reduction. If neighboring cities without the initiative saw similar drops, something else must be causing the decrease, undermining the initiative\'s role.',
                difficulty: 'easy'
            },
            {
                content: `A company executive argues that the open office layout has improved collaboration because the number of collaborative projects increased after removing cubicle walls.

Which of the following, if true, would most weaken the executive's argument?`,
                type: 'single_choice',
                options: [
                    'Open offices are less expensive to maintain than cubicle layouts',
                    'The company also began requiring employees to participate in more team projects at the same time',
                    'Some employees initially resisted the change to open offices',
                    'Other companies in the same industry use open office layouts',
                    'The open office includes designated quiet areas for focused work'
                ],
                correct_answer: [1],
                explanation: 'The argument links open offices to more collaboration. If the company simultaneously required more team projects, that requirement (not the layout) could explain the increase in collaborative projects.',
                difficulty: 'medium'
            },
            {
                content: `An environmentalist argues that the city's plastic bag ban has reduced plastic waste because the amount of plastic in local landfills decreased after the ban was implemented.

Which of the following, if true, would most weaken the environmentalist's argument?`,
                type: 'single_choice',
                options: [
                    'The ban was supported by local businesses',
                    'Other cities have implemented similar plastic bag bans',
                    'The city also opened a new recycling facility that diverts plastic from landfills',
                    'Reusable bag sales increased after the ban',
                    'Plastic bags take hundreds of years to decompose'
                ],
                correct_answer: [2],
                explanation: 'The argument links the bag ban to less plastic in landfills. If a new recycling facility opened, it could be diverting plastic from landfills regardless of the bag ban—an alternative explanation.',
                difficulty: 'medium'
            }
        ]
    },
    {
        title: 'Weakening - Test 4',
        category: 'Weakening',
        description: 'Advanced logical reasoning with complex arguments.',
        time_limit_minutes: 15,
        questions: [
            {
                content: `A university administrator argues that the new tutoring center has improved student retention because fewer students dropped out in the year after the center opened.

Which of the following, if true, would most weaken the administrator's argument?`,
                type: 'single_choice',
                options: [
                    'The tutoring center employs graduate students as tutors',
                    'The university also reduced tuition costs significantly that year',
                    'Students who used the tutoring center reported positive experiences',
                    'The tutoring center offers services in multiple subjects',
                    'Other universities have successful tutoring programs'
                ],
                correct_answer: [1],
                explanation: 'The argument credits the tutoring center for improved retention. If tuition was also reduced, students might have stayed because of lower costs, not the tutoring center.',
                difficulty: 'easy'
            },
            {
                content: `A company claims that its employee wellness program reduces healthcare costs because departments participating in the program had 15% lower healthcare claims than non-participating departments.

Which of the following, if true, would most weaken the company's claim?`,
                type: 'single_choice',
                options: [
                    'The wellness program includes gym memberships and health screenings',
                    'Participation in the wellness program is voluntary',
                    'Healthcare costs have been rising industry-wide',
                    'The company has offered the program for five years',
                    'Employees who are already healthier tend to volunteer for wellness programs'
                ],
                correct_answer: [4],
                explanation: 'The claim assumes the program causes lower costs. If healthier employees self-select into the program, their lower costs reflect pre-existing health, not program effectiveness—selection bias.',
                difficulty: 'hard'
            },
            {
                content: `A marketing firm argues that its advertising campaign was successful because sales increased 25% during the campaign period.

Which of the following, if true, would most weaken the firm's argument?`,
                type: 'single_choice',
                options: [
                    'The advertising campaign used multiple media channels',
                    'The product\'s main competitor went out of business during the same period',
                    'The campaign cost less than previous advertising efforts',
                    'Consumer surveys showed high awareness of the advertisements',
                    'The company plans to hire the firm for future campaigns'
                ],
                correct_answer: [1],
                explanation: 'The argument links the campaign to sales increases. If the main competitor went out of business, customers may have switched regardless of advertising—an alternative explanation for increased sales.',
                difficulty: 'medium'
            },
            {
                content: `A researcher concludes that video game playing improves reaction time because gamers scored higher on reaction time tests than non-gamers.

Which of the following, if true, would most weaken the researcher's conclusion?`,
                type: 'single_choice',
                options: [
                    'The study included participants of various ages',
                    'People with naturally faster reaction times tend to be drawn to video games',
                    'Reaction time is important in many video games',
                    'The study used a standardized reaction time test',
                    'Both groups were tested under identical conditions'
                ],
                correct_answer: [1],
                explanation: 'The conclusion assumes gaming causes faster reactions. If people with naturally faster reactions choose to play games, the correlation exists without gaming causing the improvement—reverse causation.',
                difficulty: 'hard'
            },
            {
                content: `A city planner argues that the new park has revitalized the neighborhood because property values increased 20% in the surrounding area after the park opened.

Which of the following, if true, would most weaken the planner's argument?`,
                type: 'single_choice',
                options: [
                    'The park includes playgrounds and walking trails',
                    'Property values in the entire city increased by 18% during the same period',
                    'Residents frequently use the park for recreation',
                    'The park was built on previously unused land',
                    'Local businesses have reported increased foot traffic'
                ],
                correct_answer: [1],
                explanation: 'The argument credits the park for 20% property value increase. If the entire city saw 18% increase, only 2% might be attributable to the park—most of the increase reflects city-wide trends.',
                difficulty: 'medium'
            },
            {
                content: `A manager argues that the new scheduling software has improved employee satisfaction because satisfaction survey scores increased after the software was adopted.

Which of the following, if true, would most weaken the manager's argument?`,
                type: 'single_choice',
                options: [
                    'The software allows employees to swap shifts easily',
                    'The company also increased wages and improved benefits at the same time',
                    'Similar software has been successful at other companies',
                    'The survey had a high response rate',
                    'Managers were trained on the new scheduling system'
                ],
                correct_answer: [1],
                explanation: 'The argument links software to improved satisfaction. If wages and benefits also improved, employees might be happier due to compensation, not scheduling software.',
                difficulty: 'easy'
            },
            {
                content: `An education researcher argues that smaller class sizes improve learning outcomes because schools with smaller classes have higher test scores on average.

Which of the following, if true, would most weaken the researcher's argument?`,
                type: 'single_choice',
                options: [
                    'Teachers report preferring smaller classes',
                    'Smaller classes are more common in wealthy districts that also have more educational resources',
                    'The correlation between class size and test scores has been observed across multiple years',
                    'Students in smaller classes receive more individual attention',
                    'Some countries with smaller class sizes have high academic achievement'
                ],
                correct_answer: [1],
                explanation: 'The argument assumes class size causes better scores. If smaller classes are in wealthier districts with more resources, those resources (not class size) might explain higher scores—confounding variable.',
                difficulty: 'hard'
            },
            {
                content: `A health organization claims that its public awareness campaign reduced smoking rates because fewer people reported smoking after the campaign ran.

Which of the following, if true, would most weaken the organization's claim?`,
                type: 'single_choice',
                options: [
                    'The campaign used multiple media platforms',
                    'Cigarette taxes were significantly increased during the same period',
                    'The campaign featured testimonials from former smokers',
                    'Survey response rates remained consistent before and after the campaign',
                    'The organization has run successful campaigns on other health topics'
                ],
                correct_answer: [1],
                explanation: 'The claim links the campaign to reduced smoking. If cigarette taxes also increased significantly, the tax increase (not the campaign) might be responsible for reduced smoking rates.',
                difficulty: 'medium'
            },
            {
                content: `A police chief argues that the department's new patrol strategy has made the city safer because response times to emergency calls have decreased.

Which of the following, if true, would most weaken the chief's argument?`,
                type: 'single_choice',
                options: [
                    'Officers received training on the new patrol routes',
                    'The number of emergency calls has also decreased significantly',
                    'Residents report feeling safer in their neighborhoods',
                    'The department has the same number of patrol officers as before',
                    'Other cities have adopted similar patrol strategies'
                ],
                correct_answer: [1],
                explanation: 'The argument links patrol strategy to faster response times. If fewer calls are being made, officers have less demand, which could explain faster responses regardless of strategy changes.',
                difficulty: 'hard'
            },
            {
                content: `A store manager argues that the new store layout increases sales because revenue increased 18% after the layout was changed.

Which of the following, if true, would most weaken the manager's argument?`,
                type: 'single_choice',
                options: [
                    'Customers can now find products more easily',
                    'The store also extended its hours and added popular new product lines',
                    'The layout change was based on research about consumer behavior',
                    'Employee satisfaction with the new layout is high',
                    'The new layout required significant investment'
                ],
                correct_answer: [1],
                explanation: 'The argument credits the layout for increased sales. If hours were extended and new products added simultaneously, those changes (not the layout) could explain the revenue increase.',
                difficulty: 'easy'
            }
        ]
    }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================
async function seed() {
    console.log('Starting GRE test seeding (Batch 2)...');
    console.log('This will ADD 14 more tests to the existing database.\n');

    // Combine all test categories
    const allTests = [
        ...noShiftTests,
        ...shiftTests,
        ...doubleBlankTests,
        ...tripleBlankTests,
        ...sentenceEquivalenceTests,
        ...readingCompTests,
        ...weakeningTests
    ];

    // Seed each test
    for (const test of allTests) {
        console.log(`Creating test: ${test.title}`);

        const { data: createdTest, error: testError } = await supabase
            .from('tests')
            .insert({
                title: test.title,
                category: test.category,
                description: test.description,
                time_limit_minutes: test.time_limit_minutes
            })
            .select()
            .single();

        if (testError) {
            console.error(`Error creating test "${test.title}":`, testError);
            continue;
        }

        // Prepare questions for this test
        const questions = test.questions.map((q, index) => ({
            test_id: createdTest.id,
            content: q.content,
            type: q.type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            order_index: index + 1
        }));

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questions);

        if (questionsError) {
            console.error(`Error creating questions for "${test.title}":`, questionsError);
        } else {
            console.log(`  ✓ Created ${questions.length} questions`);
        }
    }

    console.log('\n========================================');
    console.log('GRE test seeding (Batch 2) complete!');
    console.log(`Added ${allTests.length} new tests across 7 categories.`);
    console.log('Total tests should now be 28 (4 per category).');
    console.log('========================================');
}

seed();
