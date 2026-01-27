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

// Use service role key for seeding (bypasses RLS)
const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// ============================================================================
// NO SHIFT SENTENCES - Single blank, answer continues the sentence direction
// ============================================================================
const noShiftTests = [
    {
        title: 'No Shift Sentences - Test 1',
        category: 'No Shift Sentences',
        description: 'Practice single-blank text completion where the answer supports the sentence direction.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'The professor\'s lectures were so _______ that even the most complex theories seemed accessible to first-year students.',
                type: 'single_choice',
                options: ['lucid', 'abstruse', 'convoluted', 'esoteric', 'recondite'],
                correct_answer: [0],
                explanation: '"Lucid" means clear and easy to understand. The sentence indicates that complex theories became accessible, so we need a word meaning clear. The other options (abstruse, convoluted, esoteric, recondite) all mean difficult to understand.',
                difficulty: 'easy'
            },
            {
                content: 'The artist\'s _______ attention to detail was evident in every brushstroke of the masterpiece.',
                type: 'single_choice',
                options: ['negligent', 'meticulous', 'cursory', 'perfunctory', 'haphazard'],
                correct_answer: [1],
                explanation: '"Meticulous" means showing great attention to detail. The sentence describes careful attention evident in every brushstroke, requiring a positive word about precision. The other options suggest carelessness or lack of attention.',
                difficulty: 'easy'
            },
            {
                content: 'The diplomat\'s _______ remarks helped ease tensions between the two nations that had been on the brink of conflict.',
                type: 'single_choice',
                options: ['inflammatory', 'conciliatory', 'provocative', 'bellicose', 'acerbic'],
                correct_answer: [1],
                explanation: '"Conciliatory" means intended to placate or pacify. Since the remarks helped ease tensions, we need a word suggesting peacemaking. Inflammatory, provocative, bellicose, and acerbic would all increase tensions.',
                difficulty: 'medium'
            },
            {
                content: 'Despite her reputation for being reserved, the author\'s memoir was remarkably _______, revealing intimate details of her personal struggles.',
                type: 'single_choice',
                options: ['reticent', 'guarded', 'candid', 'circumspect', 'evasive'],
                correct_answer: [2],
                explanation: '"Candid" means open and honest. The sentence indicates the memoir revealed intimate details, contrasting with her reserved reputation. The other options (reticent, guarded, circumspect, evasive) suggest holding back information.',
                difficulty: 'medium'
            },
            {
                content: 'The scientist\'s _______ approach to research, involving years of careful observation before drawing conclusions, eventually yielded groundbreaking results.',
                type: 'single_choice',
                options: ['impetuous', 'methodical', 'rash', 'precipitate', 'hasty'],
                correct_answer: [1],
                explanation: '"Methodical" means characterized by systematic procedure. Years of careful observation indicates a systematic approach. The other options (impetuous, rash, precipitate, hasty) all suggest acting without careful consideration.',
                difficulty: 'medium'
            },
            {
                content: 'The CEO\'s _______ leadership style, characterized by open communication and shared decision-making, fostered a collaborative workplace culture.',
                type: 'single_choice',
                options: ['autocratic', 'egalitarian', 'despotic', 'tyrannical', 'dictatorial'],
                correct_answer: [1],
                explanation: '"Egalitarian" means believing in equality and shared power. Open communication and shared decision-making indicate a democratic approach. The other options describe authoritarian leadership styles.',
                difficulty: 'medium'
            },
            {
                content: 'The novel\'s protagonist, far from being a conventional hero, was a _______ figure whose moral ambiguity made readers question their own ethical assumptions.',
                type: 'single_choice',
                options: ['virtuous', 'exemplary', 'complex', 'righteous', 'noble'],
                correct_answer: [2],
                explanation: '"Complex" fits because the character has moral ambiguity. The sentence states the protagonist is NOT a conventional hero, so we need a word suggesting depth and contradiction rather than straightforward virtue.',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s arguments, though initially appearing _______, revealed upon closer examination a sophisticated internal logic that few could refute.',
                type: 'single_choice',
                options: ['coherent', 'specious', 'valid', 'sound', 'cogent'],
                correct_answer: [1],
                explanation: '"Specious" means superficially plausible but actually wrong. The sentence contrasts initial appearance with closer examination revealing sophisticated logic, suggesting the arguments first seemed flawed but were actually sound.',
                difficulty: 'hard'
            },
            {
                content: 'The historian\'s _______ research, spanning three decades and encompassing archives on four continents, produced the definitive account of the colonial era.',
                type: 'single_choice',
                options: ['superficial', 'exhaustive', 'cursory', 'desultory', 'perfunctory'],
                correct_answer: [1],
                explanation: '"Exhaustive" means comprehensive and thorough. Three decades of research across four continents indicates thoroughness. The other options suggest incomplete or shallow research.',
                difficulty: 'easy'
            },
            {
                content: 'The composer\'s late works displayed a _______ quality, stripping away the ornamental flourishes of his earlier pieces to reveal stark emotional truths.',
                type: 'single_choice',
                options: ['ornate', 'austere', 'florid', 'baroque', 'elaborate'],
                correct_answer: [1],
                explanation: '"Austere" means severe or strict in manner, without decoration. The sentence describes stripping away ornamental flourishes, indicating simplicity. The other options all suggest elaborate decoration.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'No Shift Sentences - Test 2',
        category: 'No Shift Sentences',
        description: 'Advanced single-blank text completion focusing on vocabulary in context.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'The critic\'s review was _______, praising every aspect of the performance from the acting to the set design.',
                type: 'single_choice',
                options: ['scathing', 'laudatory', 'disparaging', 'censorious', 'derogatory'],
                correct_answer: [1],
                explanation: '"Laudatory" means expressing praise. The sentence indicates the review praised every aspect, so we need a positive word. The other options all express criticism or disapproval.',
                difficulty: 'easy'
            },
            {
                content: 'The witness\'s _______ testimony, filled with precise dates and specific details, proved crucial in establishing the defendant\'s alibi.',
                type: 'single_choice',
                options: ['vague', 'circumstantial', 'detailed', 'ambiguous', 'equivocal'],
                correct_answer: [2],
                explanation: '"Detailed" fits because the testimony contained precise dates and specific details. The sentence requires a word indicating specificity and precision. The other options suggest imprecision or indirectness.',
                difficulty: 'easy'
            },
            {
                content: 'The philanthropist\'s _______ donations to medical research have funded breakthrough treatments that have saved countless lives.',
                type: 'single_choice',
                options: ['miserly', 'munificent', 'parsimonious', 'niggardly', 'stingy'],
                correct_answer: [1],
                explanation: '"Munificent" means very generous. Funding breakthrough treatments that saved countless lives indicates substantial giving. The other options all suggest reluctance to give money.',
                difficulty: 'medium'
            },
            {
                content: 'The mountain climber\'s _______ determination allowed her to summit the peak despite facing conditions that had defeated more experienced mountaineers.',
                type: 'single_choice',
                options: ['wavering', 'indomitable', 'faltering', 'vacillating', 'irresolute'],
                correct_answer: [1],
                explanation: '"Indomitable" means impossible to subdue or defeat. Succeeding where more experienced climbers failed indicates unconquerable determination. The other options suggest weakness or indecision.',
                difficulty: 'medium'
            },
            {
                content: 'The journalist\'s _______ investigation uncovered a web of corruption that implicated officials at the highest levels of government.',
                type: 'single_choice',
                options: ['superficial', 'probing', 'shallow', 'cursory', 'negligent'],
                correct_answer: [1],
                explanation: '"Probing" means seeking to explore thoroughly. Uncovering a web of corruption at the highest levels indicates deep investigation. The other options suggest insufficient depth or care.',
                difficulty: 'medium'
            },
            {
                content: 'The orchestra\'s _______ performance of the symphony brought the audience to their feet in a standing ovation lasting several minutes.',
                type: 'single_choice',
                options: ['mediocre', 'sublime', 'pedestrian', 'lackluster', 'uninspired'],
                correct_answer: [1],
                explanation: '"Sublime" means of outstanding quality, inspiring great admiration. A standing ovation lasting several minutes indicates an exceptional performance. The other options suggest ordinary or poor quality.',
                difficulty: 'easy'
            },
            {
                content: 'The architect\'s design was _______, incorporating sustainable materials and energy-efficient systems that set new standards for environmentally conscious construction.',
                type: 'single_choice',
                options: ['conventional', 'innovative', 'traditional', 'orthodox', 'derivative'],
                correct_answer: [1],
                explanation: '"Innovative" means featuring new methods or ideas. Setting new standards indicates originality. The other options suggest adherence to existing approaches rather than creating new ones.',
                difficulty: 'easy'
            },
            {
                content: 'The negotiator\'s _______ handling of the delicate situation prevented what could have been a catastrophic breakdown in diplomatic relations.',
                type: 'single_choice',
                options: ['clumsy', 'adroit', 'maladroit', 'inept', 'gauche'],
                correct_answer: [1],
                explanation: '"Adroit" means clever or skillful. Preventing a catastrophic breakdown indicates skilled handling. The other options (clumsy, maladroit, inept, gauche) all suggest lack of skill.',
                difficulty: 'hard'
            },
            {
                content: 'The poet\'s work was characterized by a _______ style that eschewed complex metaphors in favor of direct, unadorned language.',
                type: 'single_choice',
                options: ['florid', 'spare', 'ornate', 'embellished', 'grandiloquent'],
                correct_answer: [1],
                explanation: '"Spare" means simple and with no unnecessary elements. Eschewing complex metaphors and using direct, unadorned language indicates simplicity. The other options suggest elaborate or decorated style.',
                difficulty: 'hard'
            },
            {
                content: 'The documentary\'s _______ portrayal of life in the war zone, showing both the brutality and the moments of humanity, earned it critical acclaim and numerous awards.',
                type: 'single_choice',
                options: ['sanitized', 'nuanced', 'one-dimensional', 'simplistic', 'biased'],
                correct_answer: [1],
                explanation: '"Nuanced" means characterized by subtle distinctions. Showing both brutality and humanity indicates a balanced, multi-faceted portrayal. The other options suggest incomplete or skewed representation.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// SHIFT SENTENCES - Single blank with contrast words (although, however, despite)
// ============================================================================
const shiftTests = [
    {
        title: 'Shift Sentences - Test 1',
        category: 'Shift Sentences',
        description: 'Practice identifying contrast and completing sentences with opposing ideas.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'Although the novel received _______ reviews from critics, it became a bestseller among general readers.',
                type: 'single_choice',
                options: ['favorable', 'glowing', 'lukewarm', 'enthusiastic', 'positive'],
                correct_answer: [2],
                explanation: '"Although" signals contrast. The novel became a bestseller (positive), so the critics\' reviews must have been negative or unenthusiastic. "Lukewarm" means lacking enthusiasm, providing the needed contrast.',
                difficulty: 'easy'
            },
            {
                content: 'Despite his _______ demeanor in public, the comedian was known among friends for his serious, contemplative nature.',
                type: 'single_choice',
                options: ['solemn', 'jovial', 'grave', 'somber', 'melancholic'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. His private nature is serious and contemplative, so his public demeanor must be the opposite. "Jovial" means cheerful and friendly, contrasting with serious.',
                difficulty: 'easy'
            },
            {
                content: 'While the experiment\'s methodology was _______, its conclusions were undermined by the researchers\' failure to account for several confounding variables.',
                type: 'single_choice',
                options: ['flawed', 'rigorous', 'deficient', 'sloppy', 'careless'],
                correct_answer: [1],
                explanation: '"While" signals contrast. The conclusions were undermined (negative), so the methodology must have been positive. "Rigorous" means extremely thorough, contrasting with the flawed conclusions.',
                difficulty: 'medium'
            },
            {
                content: 'However _______ the task appeared at first, it proved to be surprisingly manageable once we developed a systematic approach.',
                type: 'single_choice',
                options: ['simple', 'straightforward', 'daunting', 'elementary', 'trivial'],
                correct_answer: [2],
                explanation: '"However...at first" signals a contrast with what came later. The task proved manageable, so it must have initially appeared difficult. "Daunting" means intimidating or seeming difficult.',
                difficulty: 'medium'
            },
            {
                content: 'The politician\'s reputation for _______ was belied by the leaked documents showing years of secret dealings with lobbyists.',
                type: 'single_choice',
                options: ['corruption', 'integrity', 'dishonesty', 'duplicity', 'malfeasance'],
                correct_answer: [1],
                explanation: '"Belied" means contradicted or gave a false impression of. The documents showed corruption, so the reputation must have been for the opposite. "Integrity" means honesty and moral principles.',
                difficulty: 'medium'
            },
            {
                content: 'Though the artist\'s early work was largely _______, her later paintings have come to be recognized as masterpieces of the modernist movement.',
                type: 'single_choice',
                options: ['celebrated', 'acclaimed', 'ignored', 'lauded', 'venerated'],
                correct_answer: [2],
                explanation: '"Though" signals contrast. Her later paintings are recognized as masterpieces (positive), so her early work must have received the opposite reception. "Ignored" provides this contrast.',
                difficulty: 'easy'
            },
            {
                content: 'Far from being the _______ figure his opponents portrayed, the senator was actually known among colleagues for his willingness to compromise.',
                type: 'single_choice',
                options: ['moderate', 'flexible', 'intransigent', 'accommodating', 'amenable'],
                correct_answer: [2],
                explanation: '"Far from being" signals contrast with what follows. He was willing to compromise, so opponents must have portrayed him as unwilling. "Intransigent" means unwilling to compromise.',
                difficulty: 'hard'
            },
            {
                content: 'The evidence, though _______, was sufficient to convince the jury of the defendant\'s guilt beyond a reasonable doubt.',
                type: 'single_choice',
                options: ['overwhelming', 'compelling', 'circumstantial', 'conclusive', 'incontrovertible'],
                correct_answer: [2],
                explanation: '"Though" signals contrast. The evidence was sufficient to convict (strong outcome), so the evidence itself must have seemed weak. "Circumstantial" means indirect, suggesting less powerful evidence.',
                difficulty: 'hard'
            },
            {
                content: 'Despite the professor\'s _______ teaching style, students consistently rated her courses among the most intellectually stimulating at the university.',
                type: 'single_choice',
                options: ['engaging', 'dynamic', 'dry', 'captivating', 'animated'],
                correct_answer: [2],
                explanation: '"Despite" signals contrast. The courses were intellectually stimulating (positive), so the teaching style must seem negative. "Dry" means lacking liveliness, contrasting with stimulating.',
                difficulty: 'medium'
            },
            {
                content: 'Although the philosopher\'s arguments were _______, they failed to persuade an audience more swayed by emotional appeals than logical reasoning.',
                type: 'single_choice',
                options: ['fallacious', 'specious', 'cogent', 'flawed', 'unsound'],
                correct_answer: [2],
                explanation: '"Although" signals contrast. The arguments failed to persuade (negative outcome), so the arguments themselves must have been positive. "Cogent" means clear, logical, and convincing.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Shift Sentences - Test 2',
        category: 'Shift Sentences',
        description: 'Advanced practice with contrast signals and double-shift sentences.',
        time_limit_minutes: 12,
        questions: [
            {
                content: 'However much the critics may _______ the film, audiences have consistently embraced it as a modern classic.',
                type: 'single_choice',
                options: ['praise', 'celebrate', 'deride', 'extol', 'applaud'],
                correct_answer: [2],
                explanation: '"However much" signals contrast with what follows. Audiences embraced the film (positive), so critics must have done the opposite. "Deride" means to mock or ridicule.',
                difficulty: 'easy'
            },
            {
                content: 'The company\'s _______ response to the crisis, though well-intentioned, only served to exacerbate the public relations disaster.',
                type: 'single_choice',
                options: ['calculated', 'strategic', 'hasty', 'deliberate', 'measured'],
                correct_answer: [2],
                explanation: '"Though well-intentioned" signals contrast. The response made things worse despite good intentions, suggesting it was poorly executed. "Hasty" means done too quickly without thought.',
                difficulty: 'medium'
            },
            {
                content: 'While outwardly _______, the diplomat harbored deep reservations about the treaty she was negotiating.',
                type: 'single_choice',
                options: ['skeptical', 'doubtful', 'supportive', 'critical', 'opposed'],
                correct_answer: [2],
                explanation: '"While outwardly" signals contrast with inner feelings. She harbored deep reservations (negative), so her outward appearance must be positive. "Supportive" provides this contrast.',
                difficulty: 'medium'
            },
            {
                content: 'The researcher\'s findings, though potentially _______, were presented with such caution and numerous caveats that their impact was significantly diminished.',
                type: 'single_choice',
                options: ['trivial', 'insignificant', 'groundbreaking', 'mundane', 'unremarkable'],
                correct_answer: [2],
                explanation: '"Though" signals contrast. The cautious presentation diminished impact, suggesting the findings themselves were significant. "Groundbreaking" means innovative and important.',
                difficulty: 'hard'
            },
            {
                content: 'Despite her _______ in social situations, the executive was remarkably articulate and commanding in professional settings.',
                type: 'single_choice',
                options: ['confidence', 'poise', 'diffidence', 'assurance', 'composure'],
                correct_answer: [2],
                explanation: '"Despite" signals contrast. She was articulate and commanding professionally, so she must be the opposite socially. "Diffidence" means shyness or lack of self-confidence.',
                difficulty: 'hard'
            },
            {
                content: 'The author\'s prose, while undeniably _______, often sacrificed clarity for aesthetic effect, leaving readers struggling to grasp her meaning.',
                type: 'single_choice',
                options: ['pedestrian', 'elegant', 'mundane', 'prosaic', 'ordinary'],
                correct_answer: [1],
                explanation: '"While undeniably" signals what the prose WAS, contrasted with its problem. The prose prioritized aesthetic effect (artistic quality) over clarity, so it must be "elegant."',
                difficulty: 'medium'
            },
            {
                content: 'Far from demonstrating the _______ that critics had predicted, the young conductor led the orchestra with remarkable assurance and maturity.',
                type: 'single_choice',
                options: ['competence', 'expertise', 'inexperience', 'proficiency', 'mastery'],
                correct_answer: [2],
                explanation: '"Far from demonstrating" signals contrast. The conductor showed assurance and maturity (positive), so critics must have predicted the opposite. "Inexperience" contrasts with maturity.',
                difficulty: 'easy'
            },
            {
                content: 'Although the medication proved _______ in clinical trials, real-world results have been decidedly mixed.',
                type: 'single_choice',
                options: ['ineffective', 'useless', 'promising', 'harmful', 'disappointing'],
                correct_answer: [2],
                explanation: '"Although" signals contrast. Real-world results were mixed (somewhat negative), so clinical trial results must have been positive. "Promising" indicates positive early results.',
                difficulty: 'easy'
            },
            {
                content: 'However _______ the committee\'s initial assessment may have been, subsequent investigation revealed a far more complex situation than anyone had anticipated.',
                type: 'single_choice',
                options: ['thorough', 'comprehensive', 'superficial', 'exhaustive', 'meticulous'],
                correct_answer: [2],
                explanation: '"However...may have been" signals contrast with what was revealed later. The situation was more complex than anticipated, so the initial assessment must have been shallow. "Superficial" means not thorough.',
                difficulty: 'hard'
            },
            {
                content: 'The novel\'s protagonist, though portrayed as _______ by the unreliable narrator, gradually emerges through subtle textual clues as deeply compassionate.',
                type: 'single_choice',
                options: ['sympathetic', 'benevolent', 'callous', 'kindhearted', 'charitable'],
                correct_answer: [2],
                explanation: '"Though portrayed as...by the unreliable narrator" signals the portrayal contrasts with reality. The protagonist is actually compassionate, so must be portrayed as the opposite. "Callous" means unfeeling.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// DOUBLE BLANKS - Two blanks with three options each
// ============================================================================
const doubleBlankTests = [
    {
        title: 'Double Blanks - Test 1',
        category: 'Double Blanks',
        description: 'Practice two-blank text completion requiring coherent answers across both blanks.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The scientist\'s theory was initially met with (i)_______ from the academic community, but subsequent experiments that (ii)_______ her predictions eventually led to widespread acceptance.',
                type: 'double_blank',
                options: ['(i) acclaim', '(i) skepticism', '(i) enthusiasm', '(ii) contradicted', '(ii) confirmed', '(ii) ignored'],
                correct_answer: [1, 4],
                explanation: 'The theory went from rejection to acceptance. Initially there was "skepticism" (doubt), but experiments "confirmed" her predictions, leading to acceptance. The contrast between initial reaction and later acceptance is key.',
                difficulty: 'easy'
            },
            {
                content: 'Far from being (i)_______ by his early failures, the entrepreneur viewed each setback as a valuable lesson that (ii)_______ his eventual success.',
                type: 'double_blank',
                options: ['(i) discouraged', '(i) motivated', '(i) ignored', '(ii) hindered', '(ii) guaranteed', '(ii) contributed to'],
                correct_answer: [0, 5],
                explanation: '"Far from being" signals he was NOT discouraged. Viewing setbacks as valuable lessons means they "contributed to" his eventual success. The sentence describes resilience in the face of failure.',
                difficulty: 'easy'
            },
            {
                content: 'The diplomat\'s (i)_______ approach to negotiations, while frustrating to those who preferred quick resolutions, ultimately proved (ii)_______ in securing a lasting peace agreement.',
                type: 'double_blank',
                options: ['(i) hasty', '(i) methodical', '(i) reckless', '(ii) ineffective', '(ii) instrumental', '(ii) irrelevant'],
                correct_answer: [1, 4],
                explanation: 'The approach was frustrating to those wanting quick results (suggesting slowness) but proved successful. "Methodical" (systematic, careful) fits the first blank, and "instrumental" (crucial) fits the positive outcome.',
                difficulty: 'medium'
            },
            {
                content: 'The author\'s prose style, once criticized as overly (i)_______, has come to be appreciated for the very (ii)_______ that initially alienated readers.',
                type: 'double_blank',
                options: ['(i) simple', '(i) ornate', '(i) accessible', '(ii) simplicity', '(ii) complexity', '(ii) clarity'],
                correct_answer: [1, 4],
                explanation: 'The prose was criticized but later appreciated for the same quality. "Ornate" (elaborate) would be criticized, and "complexity" (the result of ornateness) is what was later appreciated.',
                difficulty: 'medium'
            },
            {
                content: 'What the documentary lacks in (i)_______ production values, it more than compensates for with its (ii)_______ portrayal of the community it depicts.',
                type: 'double_blank',
                options: ['(i) polished', '(i) amateur', '(i) crude', '(ii) superficial', '(ii) authentic', '(ii) distorted'],
                correct_answer: [0, 4],
                explanation: 'The documentary lacks something but compensates with something good. It lacks "polished" (refined) production values but has an "authentic" (genuine) portrayal. Quality compensates for technical limitations.',
                difficulty: 'medium'
            },
            {
                content: 'The professor\'s lectures, though (i)_______ in their delivery, were (ii)_______ in their intellectual content, challenging students to reconsider fundamental assumptions.',
                type: 'double_blank',
                options: ['(i) dynamic', '(i) monotonous', '(i) engaging', '(ii) shallow', '(ii) provocative', '(ii) tedious'],
                correct_answer: [1, 4],
                explanation: '"Though" signals contrast. The delivery was "monotonous" (boring), but the content was "provocative" (stimulating thought). The sentence contrasts style with substance.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s (i)_______ stance on environmental issues has won her both (ii)_______ from industry groups and admiration from conservation advocates.',
                type: 'double_blank',
                options: ['(i) ambiguous', '(i) uncompromising', '(i) moderate', '(ii) support', '(ii) criticism', '(ii) indifference'],
                correct_answer: [1, 4],
                explanation: 'Her stance causes opposite reactions from different groups. An "uncompromising" (firm) environmental stance would draw "criticism" from industry but admiration from conservationists.',
                difficulty: 'hard'
            },
            {
                content: 'The novel\'s (i)_______ narrative structure, which jumps between time periods without warning, initially (ii)_______ readers but ultimately rewards those who persist with a profound emotional payoff.',
                type: 'double_blank',
                options: ['(i) linear', '(i) fragmented', '(i) straightforward', '(ii) engaged', '(ii) disoriented', '(ii) delighted'],
                correct_answer: [1, 4],
                explanation: 'Jumping between time periods without warning describes a "fragmented" (broken into pieces) structure. This would "disorient" (confuse) readers initially, though it rewards persistence.',
                difficulty: 'medium'
            },
            {
                content: 'The artist\'s transition from (i)_______ works that sold for millions to creating free public installations represented not a commercial failure but a philosophical (ii)_______ about the purpose of art.',
                type: 'double_blank',
                options: ['(i) commercial', '(i) obscure', '(i) modest', '(ii) confusion', '(ii) statement', '(ii) contradiction'],
                correct_answer: [0, 4],
                explanation: 'The transition from selling for millions (commercial success) to free public work represents a deliberate choice. "Commercial" works contrasts with free installations, and this change is a philosophical "statement."',
                difficulty: 'hard'
            },
            {
                content: 'The biographer\'s (i)_______ treatment of her subject, avoiding both hagiography and character assassination, provides readers with a (ii)_______ portrait of a genuinely complicated individual.',
                type: 'double_blank',
                options: ['(i) biased', '(i) balanced', '(i) critical', '(ii) simplistic', '(ii) nuanced', '(ii) flattering'],
                correct_answer: [1, 4],
                explanation: 'Avoiding both excessive praise (hagiography) and attack (character assassination) indicates a "balanced" approach. This produces a "nuanced" (subtle, complex) portrait of a complicated person.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Double Blanks - Test 2',
        category: 'Double Blanks',
        description: 'Advanced two-blank text completion with complex sentence structures.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The researcher\'s (i)_______ in pursuing her hypothesis, despite years of negative results, was finally (ii)_______ when her latest experiment yielded conclusive evidence.',
                type: 'double_blank',
                options: ['(i) hesitation', '(i) persistence', '(i) indifference', '(ii) vindicated', '(ii) criticized', '(ii) questioned'],
                correct_answer: [1, 3],
                explanation: 'Continuing despite negative results shows "persistence" (determination). When the experiment succeeded, this persistence was "vindicated" (proven justified).',
                difficulty: 'easy'
            },
            {
                content: 'The CEO\'s (i)_______ management style created a culture of fear that (ii)_______ creativity and ultimately contributed to the company\'s decline.',
                type: 'double_blank',
                options: ['(i) collaborative', '(i) authoritarian', '(i) flexible', '(ii) fostered', '(ii) stifled', '(ii) rewarded'],
                correct_answer: [1, 4],
                explanation: 'A culture of fear leading to decline suggests negative leadership. "Authoritarian" (demanding strict obedience) creates fear, and this "stifled" (suppressed) creativity.',
                difficulty: 'easy'
            },
            {
                content: 'Though the evidence for the theory remains (i)_______, many scientists have embraced it with an enthusiasm that seems (ii)_______ given the current state of the research.',
                type: 'double_blank',
                options: ['(i) overwhelming', '(i) tentative', '(i) conclusive', '(ii) justified', '(ii) premature', '(ii) understandable'],
                correct_answer: [1, 4],
                explanation: '"Though" signals contrast. The evidence is "tentative" (uncertain), making scientists\' enthusiasm "premature" (too early). The sentence critiques accepting unproven theories.',
                difficulty: 'medium'
            },
            {
                content: 'The historian\'s argument, while (i)_______ in its scholarship, suffers from a (ii)_______ that leads her to overlook evidence contradicting her thesis.',
                type: 'double_blank',
                options: ['(i) meticulous', '(i) careless', '(i) superficial', '(ii) objectivity', '(ii) thoroughness', '(ii) bias'],
                correct_answer: [0, 5],
                explanation: '"While" signals contrast between strengths and weaknesses. The scholarship is "meticulous" (careful), but "bias" (prejudice) causes her to overlook contradicting evidence.',
                difficulty: 'medium'
            },
            {
                content: 'The composer\'s early works were (i)_______ imitations of his predecessors, but his mature compositions display a (ii)_______ that is unmistakably his own.',
                type: 'double_blank',
                options: ['(i) original', '(i) derivative', '(i) innovative', '(ii) conventionality', '(ii) voice', '(ii) dependence'],
                correct_answer: [1, 4],
                explanation: 'Early works imitating predecessors are "derivative" (unoriginal). Mature works being unmistakably his own means he found his own "voice" (distinctive style).',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s (i)_______ in public belied the (ii)_______ with which she pursued her country\'s interests behind closed doors.',
                type: 'double_blank',
                options: ['(i) aggression', '(i) affability', '(i) hostility', '(ii) gentleness', '(ii) tenacity', '(ii) timidity'],
                correct_answer: [1, 4],
                explanation: '"Belied" means gave a false impression. Public "affability" (friendliness) hides private "tenacity" (persistent determination). The diplomat seems nice but is actually tough.',
                difficulty: 'hard'
            },
            {
                content: 'The novel\'s protagonist undergoes a transformation from (i)_______ idealist to world-weary (ii)_______, disillusioned by experiences that expose the gap between principle and practice.',
                type: 'double_blank',
                options: ['(i) naive', '(i) cynical', '(i) sophisticated', '(ii) optimist', '(ii) pragmatist', '(ii) enthusiast'],
                correct_answer: [0, 4],
                explanation: 'The character becomes disillusioned, moving from idealism to world-weariness. Starting as a "naive" (innocent) idealist, they become a "pragmatist" (practical person focused on results over principles).',
                difficulty: 'hard'
            },
            {
                content: 'What critics dismissed as (i)_______ experimentation has proven, with the passage of time, to be (ii)_______ innovation that anticipated developments in the field by decades.',
                type: 'double_blank',
                options: ['(i) groundbreaking', '(i) meaningless', '(i) brilliant', '(ii) trivial', '(ii) visionary', '(ii) conventional'],
                correct_answer: [1, 4],
                explanation: 'Critics initially dismissed it, so they called it "meaningless." Time proved it was actually "visionary" (showing foresight). The sentence describes unrecognized genius.',
                difficulty: 'hard'
            },
            {
                content: 'The architect\'s design, while (i)_______ in its aesthetic ambitions, proved (ii)_______ when engineers attempted to translate the plans into a functional building.',
                type: 'double_blank',
                options: ['(i) modest', '(i) audacious', '(i) conventional', '(ii) straightforward', '(ii) impractical', '(ii) successful'],
                correct_answer: [1, 4],
                explanation: '"While" signals contrast. The design was "audacious" (bold, ambitious) aesthetically but "impractical" (not workable) when engineers tried to build it.',
                difficulty: 'medium'
            },
            {
                content: 'The memoir\'s (i)_______ frankness about the author\'s struggles with addiction has been praised for (ii)_______ a subject that remains taboo in many communities.',
                type: 'double_blank',
                options: ['(i) calculated', '(i) unflinching', '(i) reluctant', '(ii) avoiding', '(ii) sensationalizing', '(ii) destigmatizing'],
                correct_answer: [1, 5],
                explanation: 'The frankness is praised, so it\'s "unflinching" (not hesitating to address difficult topics). This openness helps by "destigmatizing" (removing shame from) a taboo subject.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// TRIPLE BLANKS - Three blanks with three options each
// ============================================================================
const tripleBlankTests = [
    {
        title: 'Triple Blanks - Test 1',
        category: 'Triple Blanks',
        description: 'Practice three-blank text completion requiring coherent narrative across all blanks.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The committee\'s report was surprisingly (i)_______ given the (ii)_______ nature of the issues it addressed; rather than offering concrete recommendations, it merely (iii)_______ the need for further study.',
                type: 'triple_blank',
                options: ['(i) comprehensive', '(i) superficial', '(i) balanced', '(ii) simple', '(ii) complex', '(ii) trivial', '(iii) dismissed', '(iii) emphasized', '(iii) resolved'],
                correct_answer: [1, 4, 7],
                explanation: 'The report was "superficial" (shallow) despite "complex" issues. Rather than solving problems, it merely "emphasized" the need for more study—a criticism of inadequate response to serious issues.',
                difficulty: 'medium'
            },
            {
                content: 'Though the author\'s first novel was (i)_______ by critics who found its themes (ii)_______, her second work demonstrated a maturity that even her harshest detractors had to (iii)_______.',
                type: 'triple_blank',
                options: ['(i) celebrated', '(i) dismissed', '(i) ignored', '(ii) profound', '(ii) derivative', '(ii) original', '(iii) acknowledge', '(iii) dispute', '(iii) exaggerate'],
                correct_answer: [1, 4, 6],
                explanation: '"Though" signals contrast. First novel: "dismissed" (rejected) for being "derivative" (unoriginal). Second novel\'s maturity forced detractors to "acknowledge" improvement.',
                difficulty: 'medium'
            },
            {
                content: 'The scientist\'s (i)_______ approach to research—characterized by (ii)_______ attention to methodology—initially slowed her progress but ultimately ensured that her findings could withstand the most (iii)_______ scrutiny.',
                type: 'triple_blank',
                options: ['(i) careless', '(i) meticulous', '(i) hasty', '(ii) scant', '(ii) painstaking', '(ii) casual', '(iii) superficial', '(iii) rigorous', '(iii) lenient'],
                correct_answer: [1, 4, 7],
                explanation: 'The approach slowed progress but ensured robust findings. "Meticulous" (careful) with "painstaking" (thorough) attention meant findings could withstand "rigorous" (thorough, demanding) scrutiny.',
                difficulty: 'easy'
            },
            {
                content: 'While the politician\'s rhetoric was (i)_______, appealing to voters\' basest instincts, her actual policies were surprisingly (ii)_______, suggesting that her inflammatory speeches were merely a (iii)_______ designed to win elections.',
                type: 'triple_blank',
                options: ['(i) moderate', '(i) incendiary', '(i) thoughtful', '(ii) extreme', '(ii) centrist', '(ii) radical', '(iii) conviction', '(iii) strategy', '(iii) mistake'],
                correct_answer: [1, 4, 7],
                explanation: '"While" signals contrast. Rhetoric was "incendiary" (inflammatory), but policies were "centrist" (moderate). This inconsistency suggests speeches were a calculated "strategy" to win votes.',
                difficulty: 'hard'
            },
            {
                content: 'The documentary\'s (i)_______ of the controversial figure, avoiding both (ii)_______ praise and unfair criticism, struck viewers as a (iii)_______ attempt to present a complete picture.',
                type: 'triple_blank',
                options: ['(i) vilification', '(i) portrayal', '(i) celebration', '(ii) measured', '(ii) excessive', '(ii) deserved', '(iii) biased', '(iii) commendable', '(iii) failed'],
                correct_answer: [1, 4, 7],
                explanation: 'Avoiding extremes suggests balanced work. "Portrayal" (depiction) avoiding "excessive" (too much) praise and unfair criticism was seen as a "commendable" (praiseworthy) effort at completeness.',
                difficulty: 'medium'
            },
            {
                content: 'The theory, once considered (i)_______ by mainstream scientists, has gained (ii)_______ as new evidence has emerged; what was once dismissed as speculation is now regarded as (iii)_______ explanation for the phenomenon.',
                type: 'triple_blank',
                options: ['(i) plausible', '(i) fringe', '(i) mainstream', '(ii) notoriety', '(ii) credibility', '(ii) criticism', '(iii) an implausible', '(iii) the leading', '(iii) an outdated'],
                correct_answer: [1, 4, 7],
                explanation: 'The theory moved from rejection to acceptance. Once "fringe" (outside mainstream), it gained "credibility" (believability) and is now "the leading" (most accepted) explanation.',
                difficulty: 'easy'
            },
            {
                content: 'The artist\'s later work, marked by a (i)_______ palette and (ii)_______ compositions, represented a stark departure from the (iii)_______ pieces that had made her famous.',
                type: 'triple_blank',
                options: ['(i) vibrant', '(i) muted', '(i) colorful', '(ii) chaotic', '(ii) sparse', '(ii) cluttered', '(iii) minimalist', '(iii) elaborate', '(iii) simple'],
                correct_answer: [1, 4, 7],
                explanation: '"Stark departure" signals contrast. Later work: "muted" (subdued colors), "sparse" (minimal elements). This contrasts with "elaborate" (complex, detailed) earlier pieces that made her famous.',
                difficulty: 'hard'
            },
            {
                content: 'The historian\'s (i)_______ claim that the empire fell primarily due to economic factors has been challenged by scholars who point to the (ii)_______ of causes, arguing that such (iii)_______ explanations fail to capture the complexity of historical events.',
                type: 'triple_blank',
                options: ['(i) nuanced', '(i) reductive', '(i) comprehensive', '(ii) simplicity', '(ii) multiplicity', '(ii) absence', '(iii) multifaceted', '(iii) monocausal', '(iii) sophisticated'],
                correct_answer: [1, 4, 7],
                explanation: 'Critics say the explanation is too simple. The claim is "reductive" (oversimplified), ignoring the "multiplicity" (many different) causes. Such "monocausal" (single-cause) explanations miss complexity.',
                difficulty: 'hard'
            },
            {
                content: 'The CEO\'s (i)_______ leadership during the crisis—making quick decisions without consulting her team—was (ii)_______ by some as necessary boldness and by others as (iii)_______ disregard for collaborative norms.',
                type: 'triple_blank',
                options: ['(i) collaborative', '(i) unilateral', '(i) hesitant', '(ii) praised', '(ii) ignored', '(ii) mandated', '(iii) thoughtful', '(iii) reckless', '(iii) justified'],
                correct_answer: [1, 3, 7],
                explanation: 'Making decisions alone is "unilateral" (one-sided). Some "praised" it as boldness; others saw it as "reckless" (careless) disregard for collaboration. Different interpretations of the same behavior.',
                difficulty: 'medium'
            },
            {
                content: 'The novel\'s narrative structure is deliberately (i)_______; the author (ii)_______ traditional chronology in favor of a fragmented approach that mirrors the protagonist\'s (iii)_______ mental state.',
                type: 'triple_blank',
                options: ['(i) conventional', '(i) disorienting', '(i) straightforward', '(ii) embraces', '(ii) abandons', '(ii) refines', '(iii) stable', '(iii) disordered', '(iii) rational'],
                correct_answer: [1, 4, 7],
                explanation: 'The structure is deliberately confusing. It\'s "disorienting" (confusing), "abandons" (gives up) chronology for fragmentation that mirrors the protagonist\'s "disordered" (disturbed) mental state.',
                difficulty: 'medium'
            }
        ]
    },
    {
        title: 'Triple Blanks - Test 2',
        category: 'Triple Blanks',
        description: 'Advanced three-blank text completion with sophisticated vocabulary.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The philosopher\'s argument, though (i)_______ in its logical structure, rests on premises so (ii)_______ that critics have questioned whether the entire edifice is anything more than an elaborate (iii)_______.',
                type: 'triple_blank',
                options: ['(i) flawed', '(i) impeccable', '(i) simplistic', '(ii) sound', '(ii) dubious', '(ii) obvious', '(iii) truth', '(iii) fabrication', '(iii) oversimplification'],
                correct_answer: [1, 4, 7],
                explanation: '"Though" signals contrast. Logic is "impeccable" (flawless), but premises are "dubious" (doubtful), making critics wonder if it\'s just an elaborate "fabrication" (invention/fiction).',
                difficulty: 'hard'
            },
            {
                content: 'The reforms, (i)_______ as a means of promoting equality, have paradoxically (ii)_______ existing disparities by creating new advantages for those already (iii)_______ positioned.',
                type: 'triple_blank',
                options: ['(i) criticized', '(i) introduced', '(i) rejected', '(ii) eliminated', '(ii) exacerbated', '(ii) measured', '(iii) poorly', '(iii) strategically', '(iii) favorably'],
                correct_answer: [1, 4, 8],
                explanation: 'Reforms meant to help caused opposite effect. "Introduced" (brought in) to promote equality, they "exacerbated" (worsened) disparities by helping those already "favorably" (advantageously) positioned.',
                difficulty: 'hard'
            },
            {
                content: 'The biographer\'s (i)_______ research into her subject\'s private life has been criticized as (ii)_______, but defenders argue that such intimate details are (iii)_______ to understanding the artist\'s creative process.',
                type: 'triple_blank',
                options: ['(i) cursory', '(i) exhaustive', '(i) superficial', '(ii) necessary', '(ii) invasive', '(ii) insufficient', '(iii) irrelevant', '(iii) harmful', '(iii) essential'],
                correct_answer: [1, 4, 8],
                explanation: 'The research is deep but controversial. "Exhaustive" (thorough) research into private life is criticized as "invasive" (intrusive). Defenders say such details are "essential" (necessary) for understanding.',
                difficulty: 'medium'
            },
            {
                content: 'What began as a (i)_______ disagreement over methodology gradually (ii)_______ into a bitter personal feud that (iii)_______ the entire department for years.',
                type: 'triple_blank',
                options: ['(i) fundamental', '(i) minor', '(i) public', '(ii) dissolved', '(ii) escalated', '(ii) remained', '(iii) unified', '(iii) polarized', '(iii) ignored'],
                correct_answer: [1, 4, 7],
                explanation: 'A small conflict grew into something bigger. A "minor" (small) disagreement "escalated" (intensified) into a bitter feud that "polarized" (divided into opposing camps) the department.',
                difficulty: 'easy'
            },
            {
                content: 'The composer\'s (i)_______ incorporation of folk melodies into classical forms was initially viewed as (ii)_______, but is now recognized as a (iii)_______ synthesis that bridged disparate musical traditions.',
                type: 'triple_blank',
                options: ['(i) clumsy', '(i) innovative', '(i) conventional', '(ii) masterful', '(ii) incongruous', '(ii) traditional', '(iii) failed', '(iii) disjointed', '(iii) pioneering'],
                correct_answer: [1, 4, 8],
                explanation: 'Initial criticism gave way to recognition. The "innovative" (new, creative) incorporation was seen as "incongruous" (not fitting) but is now recognized as "pioneering" (groundbreaking).',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s (i)_______ handling of the negotiations, maintaining (ii)_______ even when provoked, ultimately proved more effective than the (iii)_______ tactics employed by her predecessors.',
                type: 'triple_blank',
                options: ['(i) aggressive', '(i) deft', '(i) incompetent', '(ii) hostility', '(ii) composure', '(ii) indifference', '(iii) conciliatory', '(iii) confrontational', '(iii) similar'],
                correct_answer: [1, 4, 7],
                explanation: 'The diplomat succeeded where others failed. "Deft" (skillful) handling with "composure" (calmness) when provoked was more effective than "confrontational" (aggressive) tactics of predecessors.',
                difficulty: 'medium'
            },
            {
                content: 'The study\'s findings, though (i)_______ with previous research, offer a more (ii)_______ understanding of the phenomenon by accounting for variables that earlier investigators had (iii)_______.',
                type: 'triple_blank',
                options: ['(i) consistent', '(i) incompatible', '(i) identical', '(ii) limited', '(ii) nuanced', '(ii) confused', '(iii) emphasized', '(iii) overlooked', '(iii) exaggerated'],
                correct_answer: [0, 4, 7],
                explanation: 'The new study builds on past work. "Consistent" (agreeing) with previous research but offering more "nuanced" (subtle) understanding by addressing variables others "overlooked" (failed to notice).',
                difficulty: 'medium'
            },
            {
                content: 'The architect\'s design was (i)_______ in its ambition, seeking to (ii)_______ the boundaries of what was structurally possible; however, budget constraints forced a more (iii)_______ final product.',
                type: 'triple_blank',
                options: ['(i) modest', '(i) audacious', '(i) practical', '(ii) respect', '(ii) transcend', '(ii) define', '(iii) ambitious', '(iii) modest', '(iii) innovative'],
                correct_answer: [1, 4, 7],
                explanation: 'Grand plans were scaled back. Design was "audacious" (bold), seeking to "transcend" (go beyond) structural limits. Budget constraints forced a more "modest" (humble, scaled-down) final product.',
                difficulty: 'easy'
            },
            {
                content: 'The novel presents history not as a (i)_______ march toward progress but as a (ii)_______ process marked by setbacks and reversals; this (iii)_______ view challenges comforting narratives of inevitable improvement.',
                type: 'triple_blank',
                options: ['(i) linear', '(i) chaotic', '(i) backward', '(ii) straightforward', '(ii) cyclical', '(ii) predictable', '(iii) optimistic', '(iii) pessimistic', '(iii) romantic'],
                correct_answer: [0, 4, 7],
                explanation: 'The novel challenges progressive narratives. History is not "linear" (straight line) progress but "cyclical" (repeating patterns) with setbacks. This "pessimistic" (negative) view contradicts optimistic assumptions.',
                difficulty: 'hard'
            },
            {
                content: 'The researcher\'s methodology has been criticized as (i)_______, relying too heavily on (ii)_______ evidence while dismissing data that might (iii)_______ her predetermined conclusions.',
                type: 'triple_blank',
                options: ['(i) rigorous', '(i) biased', '(i) innovative', '(ii) contradictory', '(ii) corroborating', '(ii) objective', '(iii) support', '(iii) contradict', '(iii) confirm'],
                correct_answer: [1, 4, 7],
                explanation: 'The researcher shows prejudice. Methodology is "biased" (prejudiced), relying on "corroborating" (supporting) evidence while dismissing data that might "contradict" (oppose) her conclusions.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// SENTENCE EQUIVALENCE - Six options, select exactly two that create equivalent sentences
// ============================================================================
const sentenceEquivalenceTests = [
    {
        title: 'Sentence Equivalence - Test 1',
        category: 'Sentence Equivalence',
        description: 'Select two answers that complete the sentence with equivalent meanings.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The critic\'s review was so _______ that the playwright threatened legal action for defamation.',
                type: 'sentence_equivalence',
                options: ['laudatory', 'scathing', 'balanced', 'vitriolic', 'measured', 'complimentary'],
                correct_answer: [1, 3],
                explanation: 'The playwright threatened legal action, indicating an extremely negative review. "Scathing" and "vitriolic" both mean bitterly critical or harsh. The other options suggest positive or neutral reviews.',
                difficulty: 'easy'
            },
            {
                content: 'The professor\'s explanation was so _______ that even students with no background in physics could follow the complex concepts.',
                type: 'sentence_equivalence',
                options: ['lucid', 'abstruse', 'perspicuous', 'convoluted', 'opaque', 'technical'],
                correct_answer: [0, 2],
                explanation: 'Students with no background could follow, indicating clarity. "Lucid" and "perspicuous" both mean clear and easy to understand. The other options suggest difficulty or obscurity.',
                difficulty: 'medium'
            },
            {
                content: 'Despite the author\'s reputation for _______ prose, her latest novel is refreshingly concise.',
                type: 'sentence_equivalence',
                options: ['terse', 'prolix', 'succinct', 'verbose', 'economical', 'pithy'],
                correct_answer: [1, 3],
                explanation: '"Despite" signals contrast with "concise." The author\'s usual style must be the opposite of concise. "Prolix" and "verbose" both mean using too many words. The other options mean brief.',
                difficulty: 'medium'
            },
            {
                content: 'The diplomat\'s _______ demeanor masked a shrewd and calculating mind.',
                type: 'sentence_equivalence',
                options: ['astute', 'guileless', 'cunning', 'artless', 'sophisticated', 'worldly'],
                correct_answer: [1, 3],
                explanation: '"Masked" suggests the outer appearance differs from inner reality (shrewd and calculating). "Guileless" and "artless" both mean innocent and without deception—the opposite of shrewd.',
                difficulty: 'hard'
            },
            {
                content: 'The novel\'s protagonist is a _______ figure, inspiring both admiration and moral disapproval in equal measure.',
                type: 'sentence_equivalence',
                options: ['virtuous', 'unambiguous', 'ambivalent', 'polarizing', 'divisive', 'exemplary'],
                correct_answer: [3, 4],
                explanation: 'The character inspires opposite reactions (admiration AND disapproval). "Polarizing" and "divisive" both mean causing disagreement or opposite opinions. The other options suggest clear moral status.',
                difficulty: 'medium'
            },
            {
                content: 'The committee\'s report was criticized for its _______ treatment of the complex issues at hand.',
                type: 'sentence_equivalence',
                options: ['thorough', 'cursory', 'exhaustive', 'superficial', 'comprehensive', 'detailed'],
                correct_answer: [1, 3],
                explanation: 'The report was criticized, suggesting inadequate treatment. "Cursory" and "superficial" both mean hasty or shallow, not thorough. The other options suggest thoroughness.',
                difficulty: 'easy'
            },
            {
                content: 'The scientist was known for her _______ approach to research, never accepting results without rigorous verification.',
                type: 'sentence_equivalence',
                options: ['credulous', 'skeptical', 'gullible', 'questioning', 'trusting', 'naive'],
                correct_answer: [1, 3],
                explanation: 'Never accepting results without verification indicates doubt. "Skeptical" and "questioning" both mean inclined to doubt. The other options (credulous, gullible, trusting, naive) suggest easy acceptance.',
                difficulty: 'easy'
            },
            {
                content: 'The artist\'s early work was _______, heavily influenced by her mentors, but her mature style is unmistakably original.',
                type: 'sentence_equivalence',
                options: ['innovative', 'derivative', 'pioneering', 'imitative', 'groundbreaking', 'creative'],
                correct_answer: [1, 3],
                explanation: 'Early work influenced by mentors contrasts with later originality. "Derivative" and "imitative" both mean copying others\' work. The other options suggest originality.',
                difficulty: 'medium'
            },
            {
                content: 'The CEO\'s _______ communication style frustrated employees who preferred clear directives.',
                type: 'sentence_equivalence',
                options: ['direct', 'oblique', 'forthright', 'circuitous', 'candid', 'straightforward'],
                correct_answer: [1, 3],
                explanation: 'Employees wanted clear directives but were frustrated, suggesting unclear communication. "Oblique" and "circuitous" both mean indirect or roundabout. The other options suggest directness.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s speech was filled with _______ promises that she had no intention of keeping.',
                type: 'sentence_equivalence',
                options: ['sincere', 'hollow', 'genuine', 'empty', 'heartfelt', 'authentic'],
                correct_answer: [1, 3],
                explanation: 'Promises she had no intention of keeping are insincere. "Hollow" and "empty" both mean lacking substance or sincerity. The other options suggest genuine commitment.',
                difficulty: 'easy'
            }
        ]
    },
    {
        title: 'Sentence Equivalence - Test 2',
        category: 'Sentence Equivalence',
        description: 'Advanced practice selecting synonym pairs that complete sentences equivalently.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The historian\'s account, though engaging, takes considerable _______ with the established facts.',
                type: 'sentence_equivalence',
                options: ['liberties', 'issue', 'license', 'care', 'pains', 'exception'],
                correct_answer: [0, 2],
                explanation: '"Takes liberties with facts" and "takes license with facts" both mean treating facts loosely or inaccurately. "Though engaging" suggests the account is interesting but historically questionable.',
                difficulty: 'hard'
            },
            {
                content: 'The composer\'s final symphony displays a _______ quality, as if the artist sensed his approaching death.',
                type: 'sentence_equivalence',
                options: ['jubilant', 'elegiac', 'exuberant', 'mournful', 'festive', 'celebratory'],
                correct_answer: [1, 3],
                explanation: 'Sensing approaching death suggests sadness. "Elegiac" and "mournful" both express sorrow or lamentation. The other options suggest joy or celebration.',
                difficulty: 'medium'
            },
            {
                content: 'The researcher\'s findings, though preliminary, are _______ enough to warrant a full-scale investigation.',
                type: 'sentence_equivalence',
                options: ['inconclusive', 'promising', 'tentative', 'encouraging', 'ambiguous', 'uncertain'],
                correct_answer: [1, 3],
                explanation: 'The findings warrant full investigation, suggesting positive preliminary results. "Promising" and "encouraging" both indicate potential for success. The other options suggest doubt.',
                difficulty: 'easy'
            },
            {
                content: 'The novel\'s narrator is deliberately _______, leaving readers uncertain about the truth of the events described.',
                type: 'sentence_equivalence',
                options: ['forthright', 'unreliable', 'trustworthy', 'deceptive', 'candid', 'honest'],
                correct_answer: [1, 3],
                explanation: 'Readers are uncertain about truth, indicating narrator issues. "Unreliable" and "deceptive" both suggest the narrator cannot be trusted. The other options suggest trustworthiness.',
                difficulty: 'medium'
            },
            {
                content: 'The critic dismissed the film as _______, offering nothing that hadn\'t been seen countless times before.',
                type: 'sentence_equivalence',
                options: ['original', 'derivative', 'innovative', 'hackneyed', 'fresh', 'groundbreaking'],
                correct_answer: [1, 3],
                explanation: 'Nothing new, seen before indicates lack of originality. "Derivative" and "hackneyed" both mean unoriginal or overused. The other options suggest freshness or originality.',
                difficulty: 'medium'
            },
            {
                content: 'The manager\'s _______ leadership style left employees feeling micromanaged and distrusted.',
                type: 'sentence_equivalence',
                options: ['delegating', 'overbearing', 'empowering', 'domineering', 'trusting', 'collaborative'],
                correct_answer: [1, 3],
                explanation: 'Employees felt micromanaged and distrusted, indicating controlling leadership. "Overbearing" and "domineering" both mean excessively controlling. The other options suggest giving employees autonomy.',
                difficulty: 'easy'
            },
            {
                content: 'The philosopher\'s writing, though intellectually rigorous, is often _______ to the point of being nearly incomprehensible.',
                type: 'sentence_equivalence',
                options: ['accessible', 'abstruse', 'lucid', 'recondite', 'clear', 'straightforward'],
                correct_answer: [1, 3],
                explanation: 'Nearly incomprehensible indicates extreme difficulty. "Abstruse" and "recondite" both mean difficult to understand, obscure. The other options suggest ease of understanding.',
                difficulty: 'hard'
            },
            {
                content: 'The witness\'s _______ account of the events raised suspicions among the investigators.',
                type: 'sentence_equivalence',
                options: ['consistent', 'contradictory', 'coherent', 'inconsistent', 'logical', 'reliable'],
                correct_answer: [1, 3],
                explanation: 'Raising suspicions indicates problems with the account. "Contradictory" and "inconsistent" both mean having conflicting elements. The other options suggest a trustworthy account.',
                difficulty: 'easy'
            },
            {
                content: 'The entrepreneur\'s _______ confidence in her business plan proved well-founded when the company became enormously profitable.',
                type: 'sentence_equivalence',
                options: ['wavering', 'unwavering', 'faltering', 'steadfast', 'fluctuating', 'uncertain'],
                correct_answer: [1, 3],
                explanation: 'Confidence that proved well-founded was firm. "Unwavering" and "steadfast" both mean firmly fixed or constant. The other options suggest doubt or inconsistency.',
                difficulty: 'easy'
            },
            {
                content: 'The treaty, negotiated in haste, contained _______ language that each side later interpreted to its own advantage.',
                type: 'sentence_equivalence',
                options: ['precise', 'ambiguous', 'explicit', 'equivocal', 'specific', 'unambiguous'],
                correct_answer: [1, 3],
                explanation: 'Each side interpreting differently indicates unclear language. "Ambiguous" and "equivocal" both mean open to multiple interpretations. The other options suggest clarity.',
                difficulty: 'medium'
            }
        ]
    }
];

// ============================================================================
// READING COMPREHENSION - Passage-based questions
// ============================================================================
const readingCompTests = [
    {
        title: 'Reading Comprehension - Test 1',
        category: 'Reading Comprehension',
        description: 'Practice analyzing passages for main ideas, supporting details, and inferences.',
        time_limit_minutes: 20,
        questions: [
            {
                content: `PASSAGE: The decline of bee populations worldwide has alarmed scientists and agricultural experts alike. Bees pollinate approximately one-third of the food crops humans consume, making their survival essential to global food security. While multiple factors contribute to this decline—including pesticide use, habitat loss, and climate change—recent research has identified a particularly insidious threat: neonicotinoid pesticides. These chemicals, widely used in agriculture, do not kill bees outright but instead impair their navigation abilities, making it difficult for foragers to return to their hives. This subtle effect went undetected for years because researchers focused on acute toxicity rather than behavioral changes.

QUESTION: The primary purpose of the passage is to`,
                type: 'single_choice',
                options: [
                    'argue for an immediate ban on all pesticides',
                    'explain why bee population decline went unnoticed',
                    'describe a threat to bees and explain why it was initially overlooked',
                    'compare different factors contributing to bee decline',
                    'criticize researchers for focusing on the wrong variables'
                ],
                correct_answer: [2],
                explanation: 'The passage identifies neonicotinoids as a threat and explains that their behavioral effects "went undetected for years" because researchers focused on acute toxicity. This describes both the threat and why it was overlooked.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The decline of bee populations worldwide has alarmed scientists and agricultural experts alike. Bees pollinate approximately one-third of the food crops humans consume, making their survival essential to global food security. While multiple factors contribute to this decline—including pesticide use, habitat loss, and climate change—recent research has identified a particularly insidious threat: neonicotinoid pesticides. These chemicals, widely used in agriculture, do not kill bees outright but instead impair their navigation abilities, making it difficult for foragers to return to their hives. This subtle effect went undetected for years because researchers focused on acute toxicity rather than behavioral changes.

QUESTION: According to the passage, neonicotinoid pesticides are particularly dangerous because they`,
                type: 'single_choice',
                options: [
                    'are more toxic than other pesticides',
                    'kill bees immediately upon contact',
                    'affect bees in ways that are difficult to detect',
                    'are the primary cause of habitat loss',
                    'have been used for longer than other pesticides'
                ],
                correct_answer: [2],
                explanation: 'The passage states that neonicotinoids "do not kill bees outright but instead impair their navigation abilities" and that "this subtle effect went undetected for years." The danger lies in the difficulty of detection.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: Economists have long debated whether minimum wage increases help or harm low-income workers. Traditional economic theory suggests that raising the minimum wage above the market equilibrium will reduce employment, as businesses cut jobs to offset higher labor costs. However, empirical studies have yielded mixed results. A landmark 1994 study by Card and Krueger found that a minimum wage increase in New Jersey did not reduce employment in the fast-food industry compared to neighboring Pennsylvania. Critics argued that the study's methodology was flawed, but subsequent research using different approaches has largely supported its conclusions. The emerging consensus suggests that moderate minimum wage increases have minimal negative employment effects, though the impact of larger increases remains contested.

QUESTION: The passage suggests that the Card and Krueger study was significant primarily because it`,
                type: 'single_choice',
                options: [
                    'definitively proved that minimum wage increases help workers',
                    'used superior methodology to previous studies',
                    'provided empirical evidence challenging traditional economic predictions',
                    'ended the debate about minimum wage effects',
                    'was conducted by respected economists'
                ],
                correct_answer: [2],
                explanation: 'The passage contrasts "traditional economic theory" (predicting job losses) with the Card and Krueger finding of no employment reduction. The study was significant for providing evidence against theoretical predictions.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Economists have long debated whether minimum wage increases help or harm low-income workers. Traditional economic theory suggests that raising the minimum wage above the market equilibrium will reduce employment, as businesses cut jobs to offset higher labor costs. However, empirical studies have yielded mixed results. A landmark 1994 study by Card and Krueger found that a minimum wage increase in New Jersey did not reduce employment in the fast-food industry compared to neighboring Pennsylvania. Critics argued that the study's methodology was flawed, but subsequent research using different approaches has largely supported its conclusions. The emerging consensus suggests that moderate minimum wage increases have minimal negative employment effects, though the impact of larger increases remains contested.

QUESTION: It can be inferred from the passage that the author would most likely agree with which of the following statements?`,
                type: 'single_choice',
                options: [
                    'Traditional economic theory is fundamentally wrong about labor markets',
                    'The minimum wage should be raised as high as possible',
                    'Empirical evidence should inform policy decisions about minimum wage',
                    'Critics of the Card and Krueger study were motivated by ideology',
                    'The debate about minimum wage has been conclusively resolved'
                ],
                correct_answer: [2],
                explanation: 'The passage emphasizes empirical studies over pure theory and notes that "subsequent research...has largely supported" the findings. The author values evidence-based conclusions, though acknowledges the debate continues.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The discovery of mirror neurons in the early 1990s sparked excitement about their potential role in human cognition. These neurons, first identified in macaque monkeys, fire both when an individual performs an action and when they observe another performing the same action. Some researchers proposed that mirror neurons form the basis for empathy, language acquisition, and even consciousness itself. However, enthusiasm has given way to skepticism as the initial claims have proven difficult to verify. While brain imaging studies in humans have identified areas that respond to both action and observation, critics note that this does not prove the existence of individual mirror neurons. Moreover, the proposed links between mirror neurons and higher cognitive functions remain largely speculative, supported more by theoretical appeal than experimental evidence.

QUESTION: The passage characterizes the relationship between early claims about mirror neurons and subsequent research as one of`,
                type: 'single_choice',
                options: [
                    'confirmation and extension',
                    'enthusiasm followed by qualification',
                    'initial rejection and later acceptance',
                    'theoretical disagreement leading to synthesis',
                    'paradigm shift and revolution'
                ],
                correct_answer: [1],
                explanation: 'The passage describes how "excitement" and "enthusiasm" gave way to "skepticism" as claims proved "difficult to verify" and remain "largely speculative." This is enthusiasm followed by qualification/doubt.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The discovery of mirror neurons in the early 1990s sparked excitement about their potential role in human cognition. These neurons, first identified in macaque monkeys, fire both when an individual performs an action and when they observe another performing the same action. Some researchers proposed that mirror neurons form the basis for empathy, language acquisition, and even consciousness itself. However, enthusiasm has given way to skepticism as the initial claims have proven difficult to verify. While brain imaging studies in humans have identified areas that respond to both action and observation, critics note that this does not prove the existence of individual mirror neurons. Moreover, the proposed links between mirror neurons and higher cognitive functions remain largely speculative, supported more by theoretical appeal than experimental evidence.

QUESTION: According to the passage, the primary limitation of brain imaging studies in humans is that they`,
                type: 'single_choice',
                options: [
                    'cannot be replicated in laboratory settings',
                    'contradict findings from studies of macaque monkeys',
                    'do not demonstrate the existence of specific neurons',
                    'are too expensive to conduct on large populations',
                    'have failed to identify any relevant brain regions'
                ],
                correct_answer: [2],
                explanation: 'The passage states that "brain imaging studies...have identified areas that respond to both action and observation" but "this does not prove the existence of individual mirror neurons." The limitation is that area-level activity doesn\'t prove specific neurons exist.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Urban planners have increasingly embraced "mixed-use" development, which combines residential, commercial, and recreational spaces within the same neighborhood or building. Proponents argue that mixed-use design reduces car dependence, creates vibrant street life, and fosters community connection. However, implementing mixed-use development faces significant obstacles. Zoning regulations in many cities explicitly separate different land uses, a legacy of early twentieth-century planning that sought to protect residents from industrial pollution. Changing these regulations requires navigating complex political processes and overcoming opposition from existing residents who fear increased traffic and noise. Furthermore, mixed-use projects often struggle to secure financing, as lenders accustomed to evaluating single-use developments find the revenue projections for mixed-use projects more difficult to assess.

QUESTION: The passage mentions early twentieth-century zoning regulations primarily to`,
                type: 'single_choice',
                options: [
                    'criticize urban planners for outdated thinking',
                    'explain the historical origin of a current obstacle to mixed-use development',
                    'argue that industrial pollution remains a significant concern',
                    'suggest that zoning regulations have always been controversial',
                    'demonstrate that urban planning has improved over time'
                ],
                correct_answer: [1],
                explanation: 'The passage discusses zoning regulations as an "obstacle" to mixed-use development and explains they are "a legacy of early twentieth-century planning." The historical reference explains why the obstacle exists.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: Urban planners have increasingly embraced "mixed-use" development, which combines residential, commercial, and recreational spaces within the same neighborhood or building. Proponents argue that mixed-use design reduces car dependence, creates vibrant street life, and fosters community connection. However, implementing mixed-use development faces significant obstacles. Zoning regulations in many cities explicitly separate different land uses, a legacy of early twentieth-century planning that sought to protect residents from industrial pollution. Changing these regulations requires navigating complex political processes and overcoming opposition from existing residents who fear increased traffic and noise. Furthermore, mixed-use projects often struggle to secure financing, as lenders accustomed to evaluating single-use developments find the revenue projections for mixed-use projects more difficult to assess.

QUESTION: Based on the passage, which of the following would most likely help increase the development of mixed-use projects?`,
                type: 'single_choice',
                options: [
                    'Stricter enforcement of existing zoning regulations',
                    'Reducing the number of recreational spaces in urban areas',
                    'Developing better methods for lenders to evaluate mixed-use revenue projections',
                    'Increasing industrial activity in residential neighborhoods',
                    'Limiting community input in planning decisions'
                ],
                correct_answer: [2],
                explanation: 'The passage identifies financing difficulty as one obstacle: lenders "find the revenue projections for mixed-use projects more difficult to assess." Better assessment methods would address this specific obstacle.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The concept of "emotional intelligence" gained widespread popularity following Daniel Goleman's 1995 bestseller, which argued that EQ (emotional quotient) matters more than IQ for success in life and work. Goleman claimed that emotional intelligence—the ability to recognize and manage one's own emotions and those of others—could be measured and, crucially, could be improved through training. These claims resonated with educators and corporate trainers eager for teachable skills. However, psychologists have questioned whether emotional intelligence represents a distinct form of intelligence or simply repackages well-established personality traits. Studies attempting to demonstrate that emotional intelligence predicts success independently of traditional intelligence and personality have yielded inconsistent results. The most that can be said with confidence is that certain emotional skills correlate with positive outcomes in specific contexts.

QUESTION: The author's attitude toward the concept of emotional intelligence is best described as`,
                type: 'single_choice',
                options: [
                    'enthusiastic endorsement',
                    'cautious skepticism',
                    'complete dismissal',
                    'nostalgic appreciation',
                    'passionate advocacy'
                ],
                correct_answer: [1],
                explanation: 'The author presents both the popularity of EI and significant criticisms, concluding with a modest claim about what can be said "with confidence." This balanced but critical view represents cautious skepticism.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The concept of "emotional intelligence" gained widespread popularity following Daniel Goleman's 1995 bestseller, which argued that EQ (emotional quotient) matters more than IQ for success in life and work. Goleman claimed that emotional intelligence—the ability to recognize and manage one's own emotions and those of others—could be measured and, crucially, could be improved through training. These claims resonated with educators and corporate trainers eager for teachable skills. However, psychologists have questioned whether emotional intelligence represents a distinct form of intelligence or simply repackages well-established personality traits. Studies attempting to demonstrate that emotional intelligence predicts success independently of traditional intelligence and personality have yielded inconsistent results. The most that can be said with confidence is that certain emotional skills correlate with positive outcomes in specific contexts.

QUESTION: The passage implies that educators and corporate trainers were attracted to emotional intelligence primarily because`,
                type: 'single_choice',
                options: [
                    'they believed IQ tests were culturally biased',
                    'Goleman\'s book was a bestseller',
                    'it offered skills that could supposedly be taught and developed',
                    'psychologists unanimously endorsed the concept',
                    'traditional intelligence cannot be improved through training'
                ],
                correct_answer: [2],
                explanation: 'The passage states that Goleman claimed EI "could be improved through training" and that "these claims resonated with educators and corporate trainers eager for teachable skills." The appeal was the promise of trainable abilities.',
                difficulty: 'easy'
            }
        ]
    },
    {
        title: 'Reading Comprehension - Test 2',
        category: 'Reading Comprehension',
        description: 'Advanced passage analysis focusing on complex arguments and author perspective.',
        time_limit_minutes: 20,
        questions: [
            {
                content: `PASSAGE: The rediscovery of Mendelian genetics in 1900 initially seemed to contradict Darwin's theory of evolution by natural selection. Darwin had emphasized that evolution worked through the accumulation of small, continuous variations, while Mendel's laws described discrete, either-or inheritance patterns. Many early geneticists, known as Mendelians, argued that evolution occurred through sudden large mutations rather than gradual change. The Darwinians countered that such macromutations were too rare and usually harmful to drive evolutionary change. This bitter dispute was not resolved until the 1930s and 1940s, when mathematically sophisticated population geneticists demonstrated that Mendelian inheritance was fully compatible with gradual evolutionary change. The synthesis showed that many genes, each with small effects, could together produce the continuous variation Darwin had observed.

QUESTION: According to the passage, the apparent conflict between Mendelian genetics and Darwinian evolution centered on`,
                type: 'single_choice',
                options: [
                    'whether evolution occurred at all',
                    'the pace and nature of evolutionary change',
                    'the mathematical foundations of genetics',
                    'the relative importance of mutations versus natural selection',
                    'whether genes could be inherited'
                ],
                correct_answer: [1],
                explanation: 'The passage contrasts Darwin\'s "small, continuous variations" with Mendel\'s "discrete, either-or inheritance" and the Mendelians\' belief in "sudden large mutations" versus "gradual change." The dispute was about pace and nature of change.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The rediscovery of Mendelian genetics in 1900 initially seemed to contradict Darwin's theory of evolution by natural selection. Darwin had emphasized that evolution worked through the accumulation of small, continuous variations, while Mendel's laws described discrete, either-or inheritance patterns. Many early geneticists, known as Mendelians, argued that evolution occurred through sudden large mutations rather than gradual change. The Darwinians countered that such macromutations were too rare and usually harmful to drive evolutionary change. This bitter dispute was not resolved until the 1930s and 1940s, when mathematically sophisticated population geneticists demonstrated that Mendelian inheritance was fully compatible with gradual evolutionary change. The synthesis showed that many genes, each with small effects, could together produce the continuous variation Darwin had observed.

QUESTION: The resolution of the dispute described in the passage primarily involved`,
                type: 'single_choice',
                options: [
                    'rejecting Mendelian genetics in favor of Darwin\'s original theory',
                    'discovering that macromutations were more common than previously thought',
                    'showing how discrete genetic inheritance could produce continuous variation',
                    'proving that the Mendelians had misinterpreted Mendel\'s experiments',
                    'abandoning the concept of natural selection'
                ],
                correct_answer: [2],
                explanation: 'The passage states the synthesis "showed that many genes, each with small effects, could together produce the continuous variation Darwin had observed." This explained how discrete inheritance creates continuous variation.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Historians have traditionally portrayed the Scientific Revolution of the sixteenth and seventeenth centuries as a decisive break with medieval thought. According to this view, figures like Copernicus, Galileo, and Newton replaced superstition and religious authority with reason and empirical observation. Recent scholarship has complicated this narrative. Many "revolutionary" thinkers held beliefs that seem decidedly unscientific by modern standards: Newton devoted more energy to alchemy than to physics, and Kepler's astronomical work was motivated by mystical beliefs about cosmic harmony. Moreover, medieval natural philosophers developed sophisticated methods of logical analysis and empirical investigation that influenced later scientists. Rather than a sudden break, the emergence of modern science appears to have been a gradual transformation in which traditional and innovative elements coexisted and interacted.

QUESTION: The primary purpose of the passage is to`,
                type: 'single_choice',
                options: [
                    'argue that medieval science was superior to modern science',
                    'challenge a simplified narrative about the origins of modern science',
                    'prove that Newton and Kepler were not true scientists',
                    'demonstrate that religion and science are incompatible',
                    'explain why the Scientific Revolution failed to achieve its goals'
                ],
                correct_answer: [1],
                explanation: 'The passage presents a "traditional" view, then states "recent scholarship has complicated this narrative," providing evidence that the change was "gradual" rather than a "decisive break." It challenges a simplified narrative.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Historians have traditionally portrayed the Scientific Revolution of the sixteenth and seventeenth centuries as a decisive break with medieval thought. According to this view, figures like Copernicus, Galileo, and Newton replaced superstition and religious authority with reason and empirical observation. Recent scholarship has complicated this narrative. Many "revolutionary" thinkers held beliefs that seem decidedly unscientific by modern standards: Newton devoted more energy to alchemy than to physics, and Kepler's astronomical work was motivated by mystical beliefs about cosmic harmony. Moreover, medieval natural philosophers developed sophisticated methods of logical analysis and empirical investigation that influenced later scientists. Rather than a sudden break, the emergence of modern science appears to have been a gradual transformation in which traditional and innovative elements coexisted and interacted.

QUESTION: The passage mentions Newton's interest in alchemy primarily to`,
                type: 'single_choice',
                options: [
                    'criticize Newton\'s contributions to physics',
                    'suggest that alchemy deserves more scholarly attention',
                    'illustrate that scientific revolutionaries held beliefs inconsistent with the traditional narrative',
                    'prove that the Scientific Revolution never actually occurred',
                    'compare Newton unfavorably with medieval scholars'
                ],
                correct_answer: [2],
                explanation: 'Newton\'s alchemy is mentioned as an example of how "revolutionary" thinkers "held beliefs that seem decidedly unscientific." This supports the argument that the traditional narrative oversimplifies.',
                difficulty: 'easy'
            },
            {
                content: `PASSAGE: The global spread of English has prompted both celebration and concern. Proponents emphasize the practical benefits of a lingua franca: easier international communication, access to scientific literature, and economic opportunities. Critics counter that English dominance threatens linguistic diversity, as smaller languages decline when their speakers shift to English for education and professional advancement. This debate often overlooks a crucial point: English itself is being transformed by its global spread. The varieties of English spoken in India, Nigeria, Singapore, and elsewhere are developing their own grammatical features, vocabularies, and literary traditions. Rather than a single homogeneous language spreading from Britain or America, English is diversifying into a family of related but distinct varieties. Whether this diversification will eventually produce mutually unintelligible languages, as Latin once did, remains to be seen.

QUESTION: The author would most likely agree with which of the following statements?`,
                type: 'single_choice',
                options: [
                    'The spread of English has been entirely beneficial for global communication',
                    'Languages like Indian English and Nigerian English should be considered inferior to British English',
                    'The debate about English dominance has focused too narrowly on certain aspects',
                    'Small languages will inevitably become extinct due to English dominance',
                    'The comparison between English and Latin is fundamentally flawed'
                ],
                correct_answer: [2],
                explanation: 'The author states "this debate often overlooks a crucial point," explicitly arguing that the debate misses important considerations about English diversification. The debate has focused too narrowly.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: The global spread of English has prompted both celebration and concern. Proponents emphasize the practical benefits of a lingua franca: easier international communication, access to scientific literature, and economic opportunities. Critics counter that English dominance threatens linguistic diversity, as smaller languages decline when their speakers shift to English for education and professional advancement. This debate often overlooks a crucial point: English itself is being transformed by its global spread. The varieties of English spoken in India, Nigeria, Singapore, and elsewhere are developing their own grammatical features, vocabularies, and literary traditions. Rather than a single homogeneous language spreading from Britain or America, English is diversifying into a family of related but distinct varieties. Whether this diversification will eventually produce mutually unintelligible languages, as Latin once did, remains to be seen.

QUESTION: The reference to Latin at the end of the passage serves to`,
                type: 'single_choice',
                options: [
                    'prove that English will definitely split into separate languages',
                    'suggest a historical precedent for how a global language might evolve',
                    'criticize the Roman Empire\'s language policies',
                    'argue that English speakers should study Latin',
                    'demonstrate that language diversification is always harmful'
                ],
                correct_answer: [1],
                explanation: 'The Latin reference illustrates how a widespread language (Latin) evolved into distinct languages (Romance languages). It provides a historical precedent for possible English evolution, without claiming certainty.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Cognitive scientists have long debated whether human reasoning follows the rules of formal logic or relies on mental shortcuts known as heuristics. Classic experiments by Kahneman and Tversky demonstrated that people systematically violate logical principles when making judgments under uncertainty. For example, subjects judge "Linda is a bank teller and feminist" as more probable than "Linda is a bank teller," even though the conjunction cannot logically be more likely than one of its components. Such findings led many researchers to conclude that human reasoning is fundamentally irrational. However, an alternative interpretation has gained traction. Perhaps people are not trying to solve abstract logic problems but are instead responding to what they perceive as conversational cues. In everyday conversation, saying "Linda is a bank teller" when you know she is also a feminist would be misleading. Viewed through this lens, responses that violate formal logic may reflect sophisticated social reasoning rather than cognitive deficiency.

QUESTION: The passage suggests that the "alternative interpretation" differs from the earlier conclusion primarily in its`,
                type: 'single_choice',
                options: [
                    'assessment of human rational capabilities',
                    'acceptance of Kahneman and Tversky\'s experimental findings',
                    'understanding of formal logic',
                    'view of whether heuristics exist',
                    'definition of probability'
                ],
                correct_answer: [0],
                explanation: 'The earlier conclusion was that human reasoning is "fundamentally irrational." The alternative suggests responses "reflect sophisticated social reasoning rather than cognitive deficiency." The difference is in assessing human rational capabilities.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Cognitive scientists have long debated whether human reasoning follows the rules of formal logic or relies on mental shortcuts known as heuristics. Classic experiments by Kahneman and Tversky demonstrated that people systematically violate logical principles when making judgments under uncertainty. For example, subjects judge "Linda is a bank teller and feminist" as more probable than "Linda is a bank teller," even though the conjunction cannot logically be more likely than one of its components. Such findings led many researchers to conclude that human reasoning is fundamentally irrational. However, an alternative interpretation has gained traction. Perhaps people are not trying to solve abstract logic problems but are instead responding to what they perceive as conversational cues. In everyday conversation, saying "Linda is a bank teller" when you know she is also a feminist would be misleading. Viewed through this lens, responses that violate formal logic may reflect sophisticated social reasoning rather than cognitive deficiency.

QUESTION: According to the alternative interpretation described in the passage, subjects in the Linda experiment`,
                type: 'single_choice',
                options: [
                    'failed to understand the question being asked',
                    'were trying to demonstrate their knowledge of probability',
                    'interpreted the question differently than the experimenters intended',
                    'were influenced by their political beliefs about feminism',
                    'understood formal logic but deliberately gave wrong answers'
                ],
                correct_answer: [2],
                explanation: 'The alternative view suggests people "are not trying to solve abstract logic problems but are instead responding to what they perceive as conversational cues." They interpreted the question as conversational, not logical.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Archaeological evidence has transformed our understanding of Viking society. Popular images of Vikings as savage raiders, while not entirely false, capture only one dimension of a complex civilization. Recent excavations reveal sophisticated craftsmanship, extensive trade networks stretching from Baghdad to Newfoundland, and a legal system that granted women unusual rights for the medieval period. The Vikings' reputation for violence stems partly from the written records of their victims—primarily Christian monks whose monasteries were frequent targets. These accounts naturally emphasized Viking brutality while ignoring their peaceful trading activities. This historiographical bias persisted for centuries because the Vikings themselves left few written records, allowing their enemies' narratives to dominate. The archaeological turn in Viking studies has provided a corrective, revealing a culture that was simultaneously violent and creative, exploitative and entrepreneurial.

QUESTION: The passage implies that Christian monks' accounts of Vikings were`,
                type: 'single_choice',
                options: [
                    'completely fabricated',
                    'accurate but incomplete',
                    'based on secondhand information',
                    'deliberately destroyed by Vikings',
                    'more reliable than archaeological evidence'
                ],
                correct_answer: [1],
                explanation: 'The passage says the popular image is "not entirely false" (accurate) but captures "only one dimension" (incomplete). Monks "emphasized Viking brutality while ignoring their peaceful trading activities" - selective but not fabricated.',
                difficulty: 'medium'
            },
            {
                content: `PASSAGE: Archaeological evidence has transformed our understanding of Viking society. Popular images of Vikings as savage raiders, while not entirely false, capture only one dimension of a complex civilization. Recent excavations reveal sophisticated craftsmanship, extensive trade networks stretching from Baghdad to Newfoundland, and a legal system that granted women unusual rights for the medieval period. The Vikings' reputation for violence stems partly from the written records of their victims—primarily Christian monks whose monasteries were frequent targets. These accounts naturally emphasized Viking brutality while ignoring their peaceful trading activities. This historiographical bias persisted for centuries because the Vikings themselves left few written records, allowing their enemies' narratives to dominate. The archaeological turn in Viking studies has provided a corrective, revealing a culture that was simultaneously violent and creative, exploitative and entrepreneurial.

QUESTION: The author's primary purpose in the passage is to`,
                type: 'single_choice',
                options: [
                    'defend the Vikings against unfair accusations',
                    'argue that archaeology is superior to written historical sources',
                    'present a more nuanced understanding of Viking civilization',
                    'explain why monks were frequent targets of Viking raids',
                    'criticize earlier historians for their bias against Vikings'
                ],
                correct_answer: [2],
                explanation: 'The author presents Vikings as "complex," having both violent and peaceful aspects, being "simultaneously violent and creative, exploitative and entrepreneurial." The purpose is nuanced understanding, not defense or attack.',
                difficulty: 'easy'
            }
        ]
    }
];

// ============================================================================
// WEAKENING - Logical reasoning questions
// ============================================================================
const weakeningTests = [
    {
        title: 'Weakening - Test 1',
        category: 'Weakening',
        description: 'Practice identifying answer choices that undermine arguments.',
        time_limit_minutes: 15,
        questions: [
            {
                content: `A pharmaceutical company argues that its new drug should be approved because clinical trials showed that patients taking the drug had 40% fewer heart attacks than those taking a placebo.

Which of the following, if true, would most weaken the company's argument?`,
                type: 'single_choice',
                options: [
                    'The drug has already been approved in several European countries',
                    'Patients taking the drug experienced significant side effects, including liver damage',
                    'Heart attacks are the leading cause of death in the country',
                    'The placebo used in the trial was a sugar pill with no active ingredients',
                    'The company has developed other successful heart medications in the past'
                ],
                correct_answer: [1],
                explanation: 'The argument is that the drug should be approved based on reduced heart attacks. Significant side effects (liver damage) weaken this by suggesting the drug\'s harms may outweigh its benefits.',
                difficulty: 'easy'
            },
            {
                content: `Critics of standardized testing argue that such tests should be eliminated because test scores correlate strongly with family income, suggesting that the tests measure socioeconomic advantage rather than academic ability.

Which of the following, if true, would most weaken the critics' argument?`,
                type: 'single_choice',
                options: [
                    'Wealthy families can afford expensive test preparation courses',
                    'Test scores also correlate with the quality of instruction students receive',
                    'Students from low-income families who receive tutoring improve their scores significantly',
                    'Other measures of academic ability, such as grades, also correlate with family income',
                    'Some low-income students score higher than some high-income students'
                ],
                correct_answer: [3],
                explanation: 'The critics argue tests should be eliminated because they correlate with income. If OTHER measures (grades) also correlate with income, then the correlation isn\'t unique to standardized tests—eliminating tests won\'t solve the problem.',
                difficulty: 'hard'
            },
            {
                content: `The city council has proposed building a new sports stadium, arguing that it will stimulate economic growth by attracting tourists and creating jobs.

Which of the following, if true, would most weaken the council's argument?`,
                type: 'single_choice',
                options: [
                    'The stadium would be built using local construction workers',
                    'Similar stadium projects in other cities have failed to generate net economic benefits',
                    'Professional sports teams bring prestige to their host cities',
                    'The city has not built any major public works projects in the past decade',
                    'Many residents are enthusiastic supporters of professional sports'
                ],
                correct_answer: [1],
                explanation: 'The argument is that the stadium will stimulate economic growth. Evidence that similar projects elsewhere "failed to generate net economic benefits" directly undermines the predicted outcome.',
                difficulty: 'easy'
            },
            {
                content: `A technology company claims that remote work increases productivity because employees who work from home log more hours than those who work in the office.

Which of the following, if true, would most weaken the company's claim?`,
                type: 'single_choice',
                options: [
                    'Remote workers report higher job satisfaction than office workers',
                    'The company has invested heavily in collaboration software for remote workers',
                    'Remote workers spend a significant portion of their logged hours on non-work activities',
                    'Some managers prefer to have their teams work in the office',
                    'Remote work has become more common across the industry'
                ],
                correct_answer: [2],
                explanation: 'The argument links productivity to logged hours. If remote workers spend much of their logged time on non-work activities, more hours doesn\'t mean more productive work—it undermines the hours-productivity connection.',
                difficulty: 'medium'
            },
            {
                content: `Nutritionists recommend eating breakfast because studies show that people who eat breakfast weigh less on average than those who skip it.

Which of the following, if true, would most weaken the nutritionists' recommendation?`,
                type: 'single_choice',
                options: [
                    'Breakfast is often called the most important meal of the day',
                    'People who eat breakfast tend to have other healthy habits that contribute to lower weight',
                    'Some breakfast foods are high in sugar and low in nutritional value',
                    'Weight is influenced by many factors besides diet',
                    'The studies were conducted on large and diverse populations'
                ],
                correct_answer: [1],
                explanation: 'The argument assumes breakfast eating causes lower weight. If breakfast eaters "have other healthy habits that contribute to lower weight," the correlation might be due to those other habits, not breakfast itself (correlation vs. causation).',
                difficulty: 'medium'
            },
            {
                content: `A politician argues that the recent decrease in crime rates proves that the government's tough-on-crime policies have been effective.

Which of the following, if true, would most weaken the politician's argument?`,
                type: 'single_choice',
                options: [
                    'Crime rates have also decreased in neighboring regions that did not implement similar policies',
                    'The government has increased funding for police departments',
                    'Public support for tough-on-crime policies has increased',
                    'The crime rate had been rising before the policies were implemented',
                    'Violent crime decreased more than property crime'
                ],
                correct_answer: [0],
                explanation: 'The argument claims policies caused the decrease. If crime also decreased in areas WITHOUT these policies, something else must be causing the decrease, undermining the policy-effect connection.',
                difficulty: 'easy'
            },
            {
                content: `A company defends its decision to relocate its factory overseas by arguing that the move will lower production costs and allow the company to offer lower prices to consumers.

Which of the following, if true, would most weaken the company's defense?`,
                type: 'single_choice',
                options: [
                    'The relocation will result in the loss of domestic manufacturing jobs',
                    'Other companies in the industry have made similar relocations',
                    'The company plans to maintain its current profit margins rather than lower prices',
                    'The overseas factory will use more advanced equipment',
                    'Consumer demand for the company\'s products has been increasing'
                ],
                correct_answer: [2],
                explanation: 'The argument is that lower costs will lead to lower prices for consumers. If the company will "maintain its current profit margins rather than lower prices," the consumer benefit disappears—the justification is hollow.',
                difficulty: 'medium'
            },
            {
                content: `Researchers conclude that a new teaching method is effective because students who were taught using this method scored higher on standardized tests than students taught using traditional methods.

Which of the following, if true, would most weaken the researchers' conclusion?`,
                type: 'single_choice',
                options: [
                    'The standardized tests were administered by independent proctors',
                    'Teachers using the new method received more training than those using traditional methods',
                    'The study was conducted over a full academic year',
                    'Students in both groups came from similar socioeconomic backgrounds',
                    'The new teaching method requires more classroom resources'
                ],
                correct_answer: [1],
                explanation: 'The conclusion is that the method is effective. If teachers using it "received more training," the better results might be due to better-trained teachers, not the method itself—a confounding variable.',
                difficulty: 'hard'
            },
            {
                content: `Environmental advocates argue that the government should subsidize electric vehicles because widespread adoption of EVs would significantly reduce carbon emissions.

Which of the following, if true, would most weaken the advocates' argument?`,
                type: 'single_choice',
                options: [
                    'Electric vehicles are currently more expensive than gasoline-powered vehicles',
                    'The electricity used to charge EVs in the region comes primarily from coal-fired power plants',
                    'Many consumers are interested in purchasing electric vehicles',
                    'Electric vehicle technology has improved significantly in recent years',
                    'Some other countries have already implemented EV subsidies'
                ],
                correct_answer: [1],
                explanation: 'The argument is that EVs reduce carbon emissions. If the electricity comes from coal plants, EVs might not significantly reduce emissions—the carbon is just shifted from tailpipes to power plants.',
                difficulty: 'medium'
            },
            {
                content: `A company executive argues that the firm should hire more employees because productivity per worker has been declining, suggesting that current workers are overworked.

Which of the following, if true, would most weaken the executive's argument?`,
                type: 'single_choice',
                options: [
                    'Employee satisfaction surveys indicate high levels of job stress',
                    'The company has recently invested in new productivity-enhancing software',
                    'Competitors have similar levels of productivity per worker',
                    'The decline in productivity coincided with the installation of outdated equipment',
                    'Hiring additional employees would increase the company\'s operating costs'
                ],
                correct_answer: [3],
                explanation: 'The executive assumes declining productivity means workers are overworked. If productivity declined due to "outdated equipment," hiring more workers won\'t solve the real problem—equipment is the issue, not staffing.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Weakening - Test 2',
        category: 'Weakening',
        description: 'Advanced practice with complex arguments and subtle weakening strategies.',
        time_limit_minutes: 15,
        questions: [
            {
                content: `A university administrator argues that the school should require all students to take a public speaking course because graduates who took such courses report earning higher salaries five years after graduation.

Which of the following, if true, would most weaken the administrator's argument?`,
                type: 'single_choice',
                options: [
                    'Public speaking skills are valued by employers in many industries',
                    'Students who voluntarily take public speaking courses tend to be more ambitious and career-oriented',
                    'The public speaking course is one of the most popular electives at the university',
                    'Many successful professionals attribute their success to strong communication skills',
                    'Some students experience significant anxiety when required to speak publicly'
                ],
                correct_answer: [1],
                explanation: 'The argument assumes the course causes higher salaries. If students who take the course are "more ambitious and career-oriented," they might earn more due to ambition, not the course. Selection bias undermines causation.',
                difficulty: 'hard'
            },
            {
                content: `City planners argue that building a new subway line will reduce traffic congestion because it will provide commuters with an alternative to driving.

Which of the following, if true, would most weaken the planners' argument?`,
                type: 'single_choice',
                options: [
                    'The subway line will serve areas that currently have limited public transportation',
                    'Similar subway projects in other cities have been completed on time and within budget',
                    'Most potential subway riders currently use buses rather than cars',
                    'Traffic congestion has been worsening steadily over the past decade',
                    'The subway line will operate during peak commuting hours'
                ],
                correct_answer: [2],
                explanation: 'The argument is that the subway reduces driving by offering an alternative. If most riders "currently use buses rather than cars," the subway would take bus riders, not car drivers, and wouldn\'t reduce traffic.',
                difficulty: 'medium'
            },
            {
                content: `A historian argues that the printing press was the primary cause of the Protestant Reformation because the rapid spread of printed pamphlets allowed reformers' ideas to reach a wide audience.

Which of the following, if true, would most weaken the historian's argument?`,
                type: 'single_choice',
                options: [
                    'Many people in sixteenth-century Europe were illiterate',
                    'The Catholic Church initially underestimated the threat posed by printed materials',
                    'Luther\'s ideas were also spread through sermons and word of mouth',
                    'The printing press had been invented approximately fifty years before the Reformation began',
                    'Other religious reform movements had failed before the invention of the printing press'
                ],
                correct_answer: [3],
                explanation: 'If the printing press existed for "fifty years before the Reformation began," its mere existence wasn\'t sufficient to cause reformation—something else must explain why the Reformation happened when it did.',
                difficulty: 'hard'
            },
            {
                content: `A health organization recommends that people drink eight glasses of water daily because proper hydration is essential for physical health.

Which of the following, if true, would most weaken this recommendation?`,
                type: 'single_choice',
                options: [
                    'Many foods contain significant amounts of water',
                    'Dehydration can lead to fatigue and reduced cognitive function',
                    'Water is essential for numerous bodily functions',
                    'Most people report drinking fewer than eight glasses of water daily',
                    'The recommendation originated from a study that has since been discredited'
                ],
                correct_answer: [4],
                explanation: 'The recommendation is based on the idea that eight glasses is the proper amount. If the underlying study "has since been discredited," the specific recommendation (eight glasses) loses its scientific basis.',
                difficulty: 'easy'
            },
            {
                content: `A company executive argues that employee morale has improved because the company recently began offering flexible work hours, and employee satisfaction scores have increased.

Which of the following, if true, would most weaken the executive's argument?`,
                type: 'single_choice',
                options: [
                    'Many employees have taken advantage of the flexible hours option',
                    'The company also gave all employees a significant raise at the same time',
                    'Employee productivity has remained unchanged since the policy was implemented',
                    'Other companies in the industry do not offer flexible work hours',
                    'Employee turnover has decreased since the policy was implemented'
                ],
                correct_answer: [1],
                explanation: 'The executive attributes improved morale to flexible hours. If a "significant raise" was given simultaneously, the improved satisfaction might be due to the raise, not the schedule flexibility—an alternative explanation.',
                difficulty: 'medium'
            },
            {
                content: `Critics of social media argue that these platforms should be regulated because studies show that heavy social media users report higher rates of anxiety and depression.

Which of the following, if true, would most weaken the critics' argument?`,
                type: 'single_choice',
                options: [
                    'Social media companies generate significant revenue from advertising',
                    'People who are already prone to anxiety and depression tend to use social media more heavily',
                    'Social media allows people to maintain connections with friends and family',
                    'Rates of anxiety and depression have increased across the population in recent decades',
                    'Some countries have implemented regulations on social media companies'
                ],
                correct_answer: [1],
                explanation: 'The argument assumes social media causes anxiety/depression. If "people already prone to anxiety and depression" use it more, the correlation might be reverse causation—mental health issues drive usage, not the other way around.',
                difficulty: 'medium'
            },
            {
                content: `A school board argues that reducing class sizes will improve student performance because students in smaller classes receive more individual attention from teachers.

Which of the following, if true, would most weaken the school board's argument?`,
                type: 'single_choice',
                options: [
                    'Teachers generally prefer teaching smaller classes',
                    'Reducing class sizes would require hiring additional teachers',
                    'Studies show that teacher quality has a greater impact on student performance than class size',
                    'Some high-performing schools have relatively large class sizes',
                    'Students in smaller classes report enjoying school more'
                ],
                correct_answer: [2],
                explanation: 'If "teacher quality has a greater impact than class size," then focusing on class size may not be the most effective way to improve performance. It doesn\'t disprove the benefit, but suggests resources might be better spent elsewhere.',
                difficulty: 'hard'
            },
            {
                content: `An economist argues that raising the minimum wage will not increase unemployment because businesses will simply raise prices to cover the higher labor costs.

Which of the following, if true, would most weaken the economist's argument?`,
                type: 'single_choice',
                options: [
                    'Many businesses are already operating with slim profit margins',
                    'Consumers have shown willingness to pay slightly higher prices for products',
                    'In a competitive market, businesses that raise prices may lose customers to competitors who automate instead',
                    'The minimum wage has been raised several times in the past without economic collapse',
                    'Many minimum wage workers are employed by large corporations'
                ],
                correct_answer: [2],
                explanation: 'The economist assumes businesses will respond to higher costs by raising prices. If competitors can "automate instead," businesses raising prices will lose customers, forcing them to cut jobs or automate—leading to unemployment after all.',
                difficulty: 'hard'
            },
            {
                content: `A fitness expert claims that morning exercise is more effective for weight loss because people who exercise in the morning lose more weight on average than those who exercise at other times.

Which of the following, if true, would most weaken the expert's claim?`,
                type: 'single_choice',
                options: [
                    'Morning exercise can help establish a consistent routine',
                    'People who exercise in the morning are more likely to also follow strict diets',
                    'Some people find it difficult to wake up early enough for morning exercise',
                    'Exercise at any time of day provides cardiovascular benefits',
                    'The study controlled for the duration and intensity of exercise'
                ],
                correct_answer: [1],
                explanation: 'The claim is that morning exercise itself is more effective. If morning exercisers "also follow strict diets," their greater weight loss might be due to diet, not exercise timing—a confounding variable.',
                difficulty: 'medium'
            },
            {
                content: `A city official argues that installing security cameras in public spaces reduces crime because the city's crime rate dropped significantly after cameras were installed in the downtown area.

Which of the following, if true, would most weaken the official's argument?`,
                type: 'single_choice',
                options: [
                    'The cameras are monitored by trained security personnel',
                    'Similar camera systems have been installed in other cities',
                    'Crime in areas just outside the camera coverage zone increased after the cameras were installed',
                    'The cameras have helped police identify suspects in several high-profile cases',
                    'Public opinion polls show strong support for the camera program'
                ],
                correct_answer: [2],
                explanation: 'If crime "increased in areas just outside the camera coverage," the cameras may have simply displaced crime rather than reduced it overall. Total crime might be unchanged—it just moved to unmonitored areas.',
                difficulty: 'medium'
            }
        ]
    }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================
async function seed() {
    console.log('Starting GRE test seeding...');
    console.log('This will clear existing tests and create new GRE-styled content.\n');

    // Clear existing data
    console.log('Clearing existing tests...');
    const { error: deleteError } = await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error('Error clearing tests:', deleteError);
        return;
    }
    console.log('Existing tests cleared.\n');

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
    console.log('GRE test seeding complete!');
    console.log(`Created ${allTests.length} tests across 7 categories.`);
    console.log('========================================');
}

seed();
