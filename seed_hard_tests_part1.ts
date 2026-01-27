import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
// NO SHIFT SENTENCES - HARD TESTS
// ============================================================================
const noShiftHard = [
    {
        title: 'No Shift Sentences - Hard Test 1',
        category: 'No Shift Sentences',
        description: 'Challenging vocabulary and nuanced contextual clues.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The philosopher\'s arguments, though superficially _______, reveal upon closer examination a coherent underlying logic that unifies his seemingly disparate claims.',
                type: 'single_choice',
                options: ['cogent', 'disjointed', 'pellucid', 'straightforward', 'harmonious'],
                correct_answer: [1],
                explanation: '"Though superficially...reveal upon closer examination" indicates initial appearance differs from deeper reality. Arguments seem "disjointed" (disconnected) but are actually unified. This is NOT a shift sentence because both parts describe the same arguments.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat\'s _______ was legendary; she could deliver the most devastating criticism in language so measured that her targets often failed to recognize they had been rebuked.',
                type: 'single_choice',
                options: ['bluntness', 'circumlocution', 'tactfulness', 'garrulousness', 'forthrightness'],
                correct_answer: [2],
                explanation: 'Delivering criticism so subtly that targets don\'t recognize it requires extreme "tactfulness" (skill in dealing with sensitive matters). The other options either suggest directness or excessive talking.',
                difficulty: 'hard'
            },
            {
                content: 'The scholar\'s _______ interpretation of the ancient text, while dismissed by traditionalists, has gained adherents among younger academics who find its unconventional methodology refreshing.',
                type: 'single_choice',
                options: ['orthodox', 'heterodox', 'conventional', 'canonical', 'mainstream'],
                correct_answer: [1],
                explanation: '"Unconventional methodology" and "dismissed by traditionalists" indicate a non-standard approach. "Heterodox" means not conforming to accepted standards or beliefs.',
                difficulty: 'hard'
            },
            {
                content: 'The artist\'s late works exhibit a _______ quality, as though she had stripped away all superfluity to reveal the essential emotional core of her subjects.',
                type: 'single_choice',
                options: ['baroque', 'lapidary', 'rococo', 'florid', 'ornate'],
                correct_answer: [1],
                explanation: '"Stripped away all superfluity" indicates precision and economy. "Lapidary" means elegantly concise, like an inscription carved in stone. The other options all suggest elaboration.',
                difficulty: 'hard'
            },
            {
                content: 'The researcher\'s _______ approach to data collection—gathering information from archives, interviews, and archaeological sites—ensured that her conclusions rested on a solid evidentiary foundation.',
                type: 'single_choice',
                options: ['haphazard', 'multifarious', 'monolithic', 'circumscribed', 'parochial'],
                correct_answer: [1],
                explanation: 'Multiple sources (archives, interviews, archaeological sites) indicate variety. "Multifarious" means many and varied. "Monolithic," "circumscribed," and "parochial" suggest limitation.',
                difficulty: 'hard'
            },
            {
                content: 'The critic\'s review was a masterpiece of _______, so subtly constructed that readers could interpret it as either lavish praise or withering condemnation depending on their predispositions.',
                type: 'single_choice',
                options: ['clarity', 'equivocation', 'forthrightness', 'candor', 'transparency'],
                correct_answer: [1],
                explanation: 'Being interpretable as either praise or condemnation indicates deliberate ambiguity. "Equivocation" means using ambiguous language to conceal the truth or avoid commitment.',
                difficulty: 'hard'
            },
            {
                content: 'The composer\'s _______ output—merely three symphonies over four decades—belied the profound influence these works would exert on subsequent generations of musicians.',
                type: 'single_choice',
                options: ['prolific', 'meager', 'voluminous', 'copious', 'abundant'],
                correct_answer: [1],
                explanation: 'Three symphonies over four decades is very little. "Meager" means lacking in quantity. The other options all suggest large amounts.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s prose style, far from the _______ verbosity of her contemporaries, achieved its effects through rigorous compression and strategic omission.',
                type: 'single_choice',
                options: ['terse', 'prolix', 'laconic', 'succinct', 'pithy'],
                correct_answer: [1],
                explanation: '"Far from" indicates contrast with her own style of "compression and strategic omission." Her contemporaries must be wordy. "Prolix" means tediously lengthy.',
                difficulty: 'hard'
            },
            {
                content: 'The judge\'s reputation for _______ impartiality made her the natural choice to arbitrate the dispute between the two corporations.',
                type: 'single_choice',
                options: ['questionable', 'unimpeachable', 'dubious', 'contested', 'suspect'],
                correct_answer: [1],
                explanation: 'Being the "natural choice" for arbitration requires trustworthy fairness. "Unimpeachable" means beyond doubt or reproach. The other options suggest questionable integrity.',
                difficulty: 'hard'
            },
            {
                content: 'The anthropologist\'s _______ fieldwork, conducted over three decades among remote communities, yielded insights that armchair theorists could never have obtained.',
                type: 'single_choice',
                options: ['perfunctory', 'cursory', 'assiduous', 'desultory', 'superficial'],
                correct_answer: [2],
                explanation: 'Three decades of fieldwork yielding unique insights indicates thorough dedication. "Assiduous" means showing great care and perseverance. The other options suggest lack of thoroughness.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'No Shift Sentences - Hard Test 2',
        category: 'No Shift Sentences',
        description: 'Expert-level vocabulary in sophisticated contexts.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'The playwright\'s dialogue achieves a remarkable _______, each line serving multiple dramatic functions while appearing completely natural.',
                type: 'single_choice',
                options: ['redundancy', 'economy', 'prolixity', 'superfluity', 'verbosity'],
                correct_answer: [1],
                explanation: 'Lines serving multiple functions while appearing natural indicates efficiency. "Economy" means careful management of resources—here, words doing multiple jobs.',
                difficulty: 'hard'
            },
            {
                content: 'The senator\'s _______ stance on the controversial legislation—neither endorsing nor opposing it—frustrated both supporters and critics who demanded clarity.',
                type: 'single_choice',
                options: ['unequivocal', 'noncommittal', 'decisive', 'forthright', 'categorical'],
                correct_answer: [1],
                explanation: 'Neither endorsing nor opposing indicates avoiding commitment. "Noncommittal" means not expressing or revealing commitment to a definite opinion.',
                difficulty: 'hard'
            },
            {
                content: 'The historian\'s account, though meticulously researched, suffers from a _______ that prevents her from acknowledging evidence contradicting her thesis.',
                type: 'single_choice',
                options: ['objectivity', 'tendentiousness', 'impartiality', 'disinterestedness', 'neutrality'],
                correct_answer: [1],
                explanation: 'Not acknowledging contradicting evidence indicates bias. "Tendentiousness" means expressing a particular bias, especially controversial one.',
                difficulty: 'hard'
            },
            {
                content: 'The architect\'s designs exhibit a _______ elegance, achieving striking visual effects through the simplest possible means.',
                type: 'single_choice',
                options: ['baroque', 'austere', 'ornate', 'lavish', 'flamboyant'],
                correct_answer: [1],
                explanation: '"Simplest possible means" indicates minimalism. "Austere" means severe or strict in appearance, without decoration.',
                difficulty: 'hard'
            },
            {
                content: 'The poet\'s _______ imagery—drawing connections between seemingly unrelated phenomena—challenged readers to perceive the world in unfamiliar ways.',
                type: 'single_choice',
                options: ['hackneyed', 'apposite', 'trite', 'incongruous', 'banal'],
                correct_answer: [3],
                explanation: 'Connecting "seemingly unrelated phenomena" suggests unexpected combinations. "Incongruous" means not in harmony or keeping with the surroundings.',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s writing style is notoriously _______; even specialists in the field often struggle to parse her dense, allusion-laden prose.',
                type: 'single_choice',
                options: ['accessible', 'pellucid', 'recondite', 'lucid', 'transparent'],
                correct_answer: [2],
                explanation: 'Even specialists struggling to understand indicates extreme difficulty. "Recondite" means little known, abstruse, dealing with profound matters.',
                difficulty: 'hard'
            },
            {
                content: 'The director\'s _______ attention to period detail—from costume stitching to background conversations—created an immersive historical atmosphere.',
                type: 'single_choice',
                options: ['cavalier', 'punctilious', 'negligent', 'cursory', 'indifferent'],
                correct_answer: [1],
                explanation: 'Attention to details as fine as costume stitching indicates extreme care. "Punctilious" means showing great attention to detail or correct behavior.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat\'s _______ remarks, carefully calibrated to avoid giving offense, nonetheless conveyed her government\'s displeasure with unmistakable clarity.',
                type: 'single_choice',
                options: ['inflammatory', 'anodyne', 'provocative', 'incendiary', 'caustic'],
                correct_answer: [1],
                explanation: '"Carefully calibrated to avoid giving offense" indicates mild language. "Anodyne" means not likely to provoke dissent or offense; innocuous.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s _______ narrator, whose account of events proves increasingly unreliable, forces readers to question their assumptions about truth in fiction.',
                type: 'single_choice',
                options: ['omniscient', 'mendacious', 'trustworthy', 'forthright', 'candid'],
                correct_answer: [1],
                explanation: 'An "increasingly unreliable" narrator suggests dishonesty. "Mendacious" means not telling the truth; lying.',
                difficulty: 'hard'
            },
            {
                content: 'The scientist\'s _______ demeanor in interviews—revealing little about her groundbreaking research—only intensified public curiosity about her work.',
                type: 'single_choice',
                options: ['effusive', 'reticent', 'garrulous', 'voluble', 'loquacious'],
                correct_answer: [1],
                explanation: '"Revealing little" indicates reluctance to speak. "Reticent" means not revealing one\'s thoughts or feelings readily. The other options suggest talkativeness.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// SHIFT SENTENCES - HARD TESTS
// ============================================================================
const shiftHard = [
    {
        title: 'Shift Sentences - Hard Test 1',
        category: 'Shift Sentences',
        description: 'Complex contrast signals with advanced vocabulary.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'Although the critic\'s assessment of the novel was ostensibly _______, a careful reading reveals subtle undercurrents of admiration beneath the surface disapproval.',
                type: 'single_choice',
                options: ['laudatory', 'adulatory', 'disparaging', 'complimentary', 'eulogistic'],
                correct_answer: [2],
                explanation: '"Ostensibly...beneath the surface" indicates appearance vs. reality. Surface "disapproval" with hidden admiration means the assessment appeared "disparaging" (critical).',
                difficulty: 'hard'
            },
            {
                content: 'Far from being the _______ ideologue his opponents portrayed, the senator had a long history of reaching across the aisle to forge bipartisan compromises.',
                type: 'single_choice',
                options: ['moderate', 'flexible', 'doctrinaire', 'pragmatic', 'accommodating'],
                correct_answer: [2],
                explanation: '"Far from being" signals contrast with actual behavior (bipartisan compromises). Opponents portrayed him as "doctrinaire" (rigidly following principles without practicality).',
                difficulty: 'hard'
            },
            {
                content: 'While the philosopher\'s early work displayed a _______ certainty about metaphysical questions, her later writings acknowledge the fundamental limits of human knowledge.',
                type: 'single_choice',
                options: ['tentative', 'dogmatic', 'hesitant', 'circumspect', 'qualified'],
                correct_answer: [1],
                explanation: '"While" signals contrast. Later acknowledgment of limits contrasts with early certainty. "Dogmatic" means inclined to lay down principles as incontrovertibly true.',
                difficulty: 'hard'
            },
            {
                content: 'However _______ the novel\'s prose may appear to casual readers, literary scholars have identified intricate patterns of symbolism woven throughout the seemingly simple narrative.',
                type: 'single_choice',
                options: ['complex', 'artless', 'sophisticated', 'ornate', 'elaborate'],
                correct_answer: [1],
                explanation: '"However...may appear" contrasts with reality. "Intricate patterns" hidden beneath "seemingly simple" surface. Prose appears "artless" (without artifice) but is actually complex.',
                difficulty: 'hard'
            },
            {
                content: 'Despite the company\'s public commitment to _______, internal documents revealed a pattern of decisions driven primarily by short-term profit considerations.',
                type: 'single_choice',
                options: ['expedience', 'sustainability', 'profitability', 'efficiency', 'pragmatism'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. Short-term profit focus contradicts public commitment. "Sustainability" (long-term thinking) contrasts with short-term profit.',
                difficulty: 'hard'
            },
            {
                content: 'Though the diplomat\'s tone remained _______ throughout the negotiations, observers noted the iron resolve underlying her courteous demeanor.',
                type: 'single_choice',
                options: ['bellicose', 'emollient', 'acerbic', 'strident', 'truculent'],
                correct_answer: [1],
                explanation: '"Though" signals contrast. "Courteous demeanor" hiding "iron resolve." Tone was "emollient" (soothing, intended to avoid conflict) despite hidden toughness.',
                difficulty: 'hard'
            },
            {
                content: 'Far from the _______ figure depicted in popular histories, the emperor was a shrewd political operator who maintained power through calculated manipulation rather than military prowess.',
                type: 'single_choice',
                options: ['cunning', 'astute', 'ingenuous', 'calculating', 'crafty'],
                correct_answer: [2],
                explanation: '"Far from" signals contrast with reality (shrewd, calculating). Popular histories depicted him as "ingenuous" (innocent, unsophisticated)—the opposite of cunning.',
                difficulty: 'hard'
            },
            {
                content: 'While the author\'s public persona suggested _______, her private correspondence reveals a mind perpetually tormented by self-doubt and creative anxiety.',
                type: 'single_choice',
                options: ['insecurity', 'diffidence', 'equanimity', 'apprehension', 'trepidation'],
                correct_answer: [2],
                explanation: '"While" signals contrast. Private torment contrasts with public persona. "Equanimity" (mental calmness, composure) is what she appeared to have publicly.',
                difficulty: 'hard'
            },
            {
                content: 'However _______ the proposed reforms may seem to traditionalists, economists argue that without them the institution faces inevitable decline.',
                type: 'single_choice',
                options: ['necessary', 'prudent', 'radical', 'sensible', 'moderate'],
                correct_answer: [2],
                explanation: '"However...may seem to traditionalists" suggests traditionalists\' negative view. They would see necessary reforms as "radical" (favoring extreme change).',
                difficulty: 'hard'
            },
            {
                content: 'Although the scientist\'s methodology was _______, her conclusions have been vindicated by subsequent research using more rigorous experimental designs.',
                type: 'single_choice',
                options: ['meticulous', 'flawed', 'rigorous', 'impeccable', 'scrupulous'],
                correct_answer: [1],
                explanation: '"Although" signals contrast. Vindication by "more rigorous" methods implies original methodology was "flawed" (imperfect) but conclusions were still correct.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Shift Sentences - Hard Test 2',
        category: 'Shift Sentences',
        description: 'Multiple shifts and sophisticated contrast patterns.',
        time_limit_minutes: 15,
        questions: [
            {
                content: 'Despite his reputation for _______, the executive surprised colleagues by acknowledging the company\'s failures with remarkable candor during the shareholder meeting.',
                type: 'single_choice',
                options: ['honesty', 'obfuscation', 'transparency', 'forthrightness', 'openness'],
                correct_answer: [1],
                explanation: '"Despite" signals contrast. "Remarkable candor" (openness) contrasts with reputation. "Obfuscation" means making something obscure or unclear.',
                difficulty: 'hard'
            },
            {
                content: 'While the artist\'s technique was undeniably _______, critics questioned whether technical virtuosity alone could compensate for the emotional vacuity of her work.',
                type: 'single_choice',
                options: ['deficient', 'consummate', 'amateurish', 'pedestrian', 'rudimentary'],
                correct_answer: [1],
                explanation: '"While" with "undeniably" introduces what\'s acknowledged. "Technical virtuosity" praised means technique was "consummate" (showing great skill), though emotion was lacking.',
                difficulty: 'hard'
            },
            {
                content: 'Far from exhibiting the _______ that characterized his youth, the reformed activist now advocates for gradual reform through existing institutional channels.',
                type: 'single_choice',
                options: ['moderation', 'restraint', 'militancy', 'prudence', 'caution'],
                correct_answer: [2],
                explanation: '"Far from" signals contrast. Current advocacy for gradual reform contrasts with youth. "Militancy" (aggressive activism) characterized his younger days.',
                difficulty: 'hard'
            },
            {
                content: 'Though the memoir\'s prose was _______, its unflinching examination of the author\'s moral failures gave it an authenticity that more polished narratives often lack.',
                type: 'single_choice',
                options: ['elegant', 'artful', 'inelegant', 'refined', 'polished'],
                correct_answer: [2],
                explanation: '"Though" signals contrast. Authenticity despite prose quality, compared to "more polished narratives." The prose was "inelegant" (lacking grace) but honest.',
                difficulty: 'hard'
            },
            {
                content: 'However _______ the composer\'s early works may now seem, they were considered dangerously avant-garde when first performed.',
                type: 'single_choice',
                options: ['innovative', 'revolutionary', 'anodyne', 'radical', 'groundbreaking'],
                correct_answer: [2],
                explanation: '"However...may now seem" contrasts present with past ("dangerously avant-garde"). What was radical now seems "anodyne" (unlikely to provoke, innocuous).',
                difficulty: 'hard'
            },
            {
                content: 'Despite the _______ of evidence supporting the theory, the scientific establishment remained skeptical, demanding replication before acceptance.',
                type: 'single_choice',
                options: ['dearth', 'paucity', 'surfeit', 'scarcity', 'absence'],
                correct_answer: [2],
                explanation: '"Despite" signals obstacle overcome. Skepticism despite evidence means there was abundant proof. "Surfeit" means an excessive amount.',
                difficulty: 'hard'
            },
            {
                content: 'While his public speeches radiated _______, those who knew him privately described a man plagued by profound insecurities and existential doubt.',
                type: 'single_choice',
                options: ['uncertainty', 'diffidence', 'assurance', 'hesitancy', 'timidity'],
                correct_answer: [2],
                explanation: '"While" signals contrast. Private insecurities contrast with public demeanor. Speeches radiated "assurance" (confidence) despite inner doubt.',
                difficulty: 'hard'
            },
            {
                content: 'Far from the _______ process its proponents promised, the implementation of the new system proved chaotic and disruptive.',
                type: 'single_choice',
                options: ['turbulent', 'seamless', 'tumultuous', 'disorderly', 'chaotic'],
                correct_answer: [1],
                explanation: '"Far from" signals contrast with reality (chaotic, disruptive). Proponents promised "seamless" (smooth, without problems) implementation.',
                difficulty: 'hard'
            },
            {
                content: 'Although the critic\'s review was superficially _______, attentive readers detected a patronizing tone that undermined its apparent praise.',
                type: 'single_choice',
                options: ['scathing', 'laudatory', 'caustic', 'excoriating', 'censorious'],
                correct_answer: [1],
                explanation: '"Although superficially" contrasts with "undermined its apparent praise." The review was superficially "laudatory" (praising) but actually patronizing.',
                difficulty: 'hard'
            },
            {
                content: 'Despite her _______ manner during the interview, the candidate\'s responses revealed a sharp intellect and thorough preparation.',
                type: 'single_choice',
                options: ['confident', 'assured', 'diffident', 'poised', 'self-possessed'],
                correct_answer: [2],
                explanation: '"Despite" signals contrast. Sharp intellect and preparation contrast with manner. "Diffident" (modest, shy) manner hid her actual capabilities.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// DOUBLE BLANKS - HARD TESTS
// ============================================================================
const doubleBlankHard = [
    {
        title: 'Double Blanks - Hard Test 1',
        category: 'Double Blanks',
        description: 'Complex relationships between blanks with advanced vocabulary.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The scholar\'s (i)_______ prose style, while winning praise from fellow academics, rendered her work (ii)_______ to the general readers she hoped to reach.',
                type: 'double_blank',
                options: ['(i) accessible', '(i) abstruse', '(i) lucid', '(ii) compelling', '(ii) inaccessible', '(ii) engaging'],
                correct_answer: [1, 4],
                explanation: 'Academics praised it but general readers couldn\'t access it. "Abstruse" (difficult to understand) prose was "inaccessible" to general readers.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat\'s (i)_______ approach to the negotiations—revealing nothing while appearing to concede much—left her counterparts (ii)_______ about her government\'s true intentions.',
                type: 'double_blank',
                options: ['(i) transparent', '(i) guileful', '(i) forthright', '(ii) informed', '(ii) mystified', '(ii) confident'],
                correct_answer: [1, 4],
                explanation: 'Revealing nothing while appearing to concede is deceptive. "Guileful" (cunning, deceitful) approach left counterparts "mystified" (utterly bewildered).',
                difficulty: 'hard'
            },
            {
                content: 'The composer\'s late works display a (i)_______ that his earlier, more exuberant compositions lacked; this quality of (ii)_______ gives them a gravitas that has ensured their enduring appeal.',
                type: 'double_blank',
                options: ['(i) frivolity', '(i) restraint', '(i) flamboyance', '(ii) excess', '(ii) sobriety', '(ii) levity'],
                correct_answer: [1, 4],
                explanation: 'Contrast with "exuberant" suggests control. "Restraint" and "sobriety" (seriousness) both indicate measured, serious quality giving gravitas.',
                difficulty: 'hard'
            },
            {
                content: 'The author\'s (i)_______ treatment of her subjects, refusing to either lionize or vilify them, exemplifies the (ii)_______ that distinguishes truly great biography from hagiography.',
                type: 'double_blank',
                options: ['(i) partisan', '(i) evenhanded', '(i) biased', '(ii) advocacy', '(ii) impartiality', '(ii) partisanship'],
                correct_answer: [1, 4],
                explanation: 'Neither lionizing nor vilifying indicates balance. "Evenhanded" (fair, impartial) treatment shows "impartiality" distinguishing biography from hagiography (idealized biography).',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s arguments, though (i)_______ in their logical structure, rest on premises so (ii)_______ that even sympathetic readers struggle to accept his conclusions.',
                type: 'double_blank',
                options: ['(i) fallacious', '(i) impeccable', '(i) flawed', '(ii) sound', '(ii) tendentious', '(ii) uncontroversial'],
                correct_answer: [1, 4],
                explanation: 'Good logic but problematic foundations. "Impeccable" (flawless) logic rests on "tendentious" (biased, controversial) premises readers can\'t accept.',
                difficulty: 'hard'
            },
            {
                content: 'The critic\'s (i)_______ dismissal of the artist\'s work reflected not careful analysis but rather a (ii)_______ hostility toward anything that challenged conventional aesthetic categories.',
                type: 'double_blank',
                options: ['(i) measured', '(i) peremptory', '(i) judicious', '(ii) justified', '(ii) reflexive', '(ii) thoughtful'],
                correct_answer: [1, 4],
                explanation: 'Not careful analysis indicates hasty judgment. "Peremptory" (insisting on immediate attention, imperious) dismissal showed "reflexive" (automatic) hostility.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s (i)_______ narrative voice, which maintains an ironic distance from all characters, prevents readers from forming the emotional (ii)_______ that conventional fiction typically encourages.',
                type: 'double_blank',
                options: ['(i) empathetic', '(i) detached', '(i) engaged', '(ii) detachment', '(ii) attachments', '(ii) distance'],
                correct_answer: [1, 4],
                explanation: '"Ironic distance from all characters" defines the voice. A "detached" narrator prevents emotional "attachments" readers usually form.',
                difficulty: 'hard'
            },
            {
                content: 'The researcher\'s (i)_______ findings, which contradicted decades of established theory, met with (ii)_______ from the scientific community until independent laboratories replicated her results.',
                type: 'double_blank',
                options: ['(i) confirmatory', '(i) heterodox', '(i) conventional', '(ii) acceptance', '(ii) incredulity', '(ii) enthusiasm'],
                correct_answer: [1, 4],
                explanation: 'Contradicting established theory is unconventional. "Heterodox" (unorthodox) findings met "incredulity" (disbelief) until replicated.',
                difficulty: 'hard'
            },
            {
                content: 'The essayist\'s (i)_______ style—piling clause upon clause in sentences that seem to never end—can either (ii)_______ or exhaust readers depending on their patience for complexity.',
                type: 'double_blank',
                options: ['(i) terse', '(i) labyrinthine', '(i) concise', '(ii) bore', '(ii) captivate', '(ii) repel'],
                correct_answer: [1, 4],
                explanation: '"Piling clause upon clause" and "never end" describes complex sentences. "Labyrinthine" (maze-like) style can "captivate" patient readers or exhaust others.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s (i)_______ on the controversial issue—taking different positions before different audiences—eventually destroyed the reputation for (ii)_______ that had been her greatest electoral asset.',
                type: 'double_blank',
                options: ['(i) consistency', '(i) equivocation', '(i) forthrightness', '(ii) opportunism', '(ii) integrity', '(ii) flexibility'],
                correct_answer: [1, 4],
                explanation: 'Different positions before different audiences is inconsistent. "Equivocation" (ambiguous language/positions) destroyed reputation for "integrity" (honesty).',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Double Blanks - Hard Test 2',
        category: 'Double Blanks',
        description: 'Subtle distinctions requiring precise vocabulary.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The historian\'s revisionist account, far from the (i)_______ narrative her critics anticipated, presents a (ii)_______ examination of evidence that challenges readers to reconsider their assumptions.',
                type: 'double_blank',
                options: ['(i) balanced', '(i) polemical', '(i) nuanced', '(ii) superficial', '(ii) rigorous', '(ii) cursory'],
                correct_answer: [1, 4],
                explanation: '"Far from" what critics expected (bias) shows something different. Critics expected "polemical" (aggressive argumentation) but got "rigorous" (thorough) examination.',
                difficulty: 'hard'
            },
            {
                content: 'The artist\'s (i)_______ with conventional techniques ultimately proved (ii)_______, leading to breakthrough innovations that redefined the medium.',
                type: 'double_blank',
                options: ['(i) satisfaction', '(i) dissatisfaction', '(i) contentment', '(ii) counterproductive', '(ii) fruitful', '(ii) futile'],
                correct_answer: [1, 4],
                explanation: 'Breakthrough innovations came from something that proved beneficial. "Dissatisfaction" with conventions was "fruitful" (productive), leading to innovation.',
                difficulty: 'hard'
            },
            {
                content: 'The scientist\'s (i)_______ hypothesis—dismissed as mere speculation by contemporaries—has been (ii)_______ by discoveries that she could not have anticipated.',
                type: 'double_blank',
                options: ['(i) conservative', '(i) audacious', '(i) timid', '(ii) refuted', '(ii) vindicated', '(ii) undermined'],
                correct_answer: [1, 4],
                explanation: 'Dismissed as speculation suggests boldness. "Audacious" (bold, daring) hypothesis was "vindicated" (proven correct) by later discoveries.',
                difficulty: 'hard'
            },
            {
                content: 'The memoir\'s (i)_______ about the author\'s moral failures stands in stark contrast to the (ii)_______ that characterizes most political autobiographies.',
                type: 'double_blank',
                options: ['(i) reticence', '(i) candor', '(i) evasiveness', '(ii) forthrightness', '(ii) self-aggrandizement', '(ii) humility'],
                correct_answer: [1, 4],
                explanation: 'Discussing moral failures honestly contrasts with typical self-promotion. "Candor" (openness) about failures contrasts with "self-aggrandizement" (self-promotion) in other memoirs.',
                difficulty: 'hard'
            },
            {
                content: 'The director\'s (i)_______ casting decisions—choosing unknown actors over established stars—proved (ii)_______ when the film\'s ensemble performances earned universal acclaim.',
                type: 'double_blank',
                options: ['(i) conventional', '(i) unorthodox', '(i) predictable', '(ii) misguided', '(ii) prescient', '(ii) regrettable'],
                correct_answer: [1, 4],
                explanation: 'Choosing unknowns over stars is unusual. "Unorthodox" (unconventional) decisions proved "prescient" (showing foresight) when acclaimed.',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s reputation for (i)_______ was belied by her private correspondence, which revealed a capacity for (ii)_______ that would have surprised her austere public image.',
                type: 'double_blank',
                options: ['(i) levity', '(i) severity', '(i) warmth', '(ii) solemnity', '(ii) playfulness', '(ii) gravity'],
                correct_answer: [1, 4],
                explanation: '"Belied" means contradicted. "Austere" public image suggests "severity" (sternness), but correspondence showed surprising "playfulness."',
                difficulty: 'hard'
            },
            {
                content: 'The treaty\'s deliberately (i)_______ language, which allowed each party to interpret its obligations differently, ultimately proved (ii)_______ when disputes arose that the text could not resolve.',
                type: 'double_blank',
                options: ['(i) precise', '(i) ambiguous', '(i) explicit', '(ii) advantageous', '(ii) problematic', '(ii) beneficial'],
                correct_answer: [1, 4],
                explanation: 'Different interpretations require unclear language. "Ambiguous" language became "problematic" when disputes arose it couldn\'t resolve.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s (i)_______ depiction of rural poverty, drawn from personal experience, lent her work an (ii)_______ that more privileged writers could not achieve.',
                type: 'double_blank',
                options: ['(i) romanticized', '(i) unflinching', '(i) idealized', '(ii) artificiality', '(ii) authenticity', '(ii) pretension'],
                correct_answer: [1, 4],
                explanation: 'Personal experience creates honest portrayal. "Unflinching" (not avoiding difficult truths) depiction gave "authenticity" privileged writers couldn\'t match.',
                difficulty: 'hard'
            },
            {
                content: 'The executive\'s (i)_______ management style, which micromanaged every detail, created a culture of (ii)_______ that stifled employee initiative and creativity.',
                type: 'double_blank',
                options: ['(i) delegating', '(i) overbearing', '(i) trusting', '(ii) empowerment', '(ii) dependency', '(ii) autonomy'],
                correct_answer: [1, 4],
                explanation: 'Micromanaging is controlling. "Overbearing" (domineering) management created "dependency" (reliance on others) rather than independent initiative.',
                difficulty: 'hard'
            },
            {
                content: 'The poet\'s (i)_______ verse forms—fourteen-line sonnets with strict rhyme schemes—might seem (ii)_______ to modern readers accustomed to free verse, but within these constraints she achieved remarkable expressive range.',
                type: 'double_blank',
                options: ['(i) experimental', '(i) traditional', '(i) innovative', '(ii) liberating', '(ii) confining', '(ii) freeing'],
                correct_answer: [1, 4],
                explanation: 'Sonnets with strict rhyme schemes are established forms. "Traditional" forms might seem "confining" (restrictive) to those used to free verse.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// TRIPLE BLANKS - HARD TESTS
// ============================================================================
const tripleBlankHard = [
    {
        title: 'Triple Blanks - Hard Test 1',
        category: 'Triple Blanks',
        description: 'Complex three-blank passages requiring sophisticated reasoning.',
        time_limit_minutes: 20,
        questions: [
            {
                content: 'The biographer\'s (i)_______ approach to her subject—neither (ii)_______ nor unduly critical—has been praised for achieving the (iii)_______ that eludes writers who become either advocates or prosecutors of the figures they study.',
                type: 'triple_blank',
                options: ['(i) partisan', '(i) dispassionate', '(i) biased', '(ii) hagiographic', '(ii) objective', '(ii) neutral', '(iii) partiality', '(iii) objectivity', '(iii) advocacy'],
                correct_answer: [1, 3, 7],
                explanation: 'Neither overly positive nor negative suggests balance. "Dispassionate" (unemotional) approach, neither "hagiographic" (worshipful) nor critical, achieves "objectivity."',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s early work displays a (i)_______ confidence in reason\'s power to resolve all disputes; her later writing, by contrast, exhibits a (ii)_______ skepticism about such (iii)_______ claims.',
                type: 'triple_blank',
                options: ['(i) qualified', '(i) unwarranted', '(i) tentative', '(ii) healthy', '(ii) unjustified', '(ii) misguided', '(iii) modest', '(iii) sweeping', '(iii) limited'],
                correct_answer: [1, 3, 7],
                explanation: 'Early overconfidence vs. later doubt. "Unwarranted" (unjustified) early confidence contrasts with "healthy" later skepticism about "sweeping" (broad, comprehensive) claims.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat\'s (i)_______ demeanor during negotiations—revealing nothing of her government\'s (ii)_______ position—frustrated counterparts who mistook her (iii)_______ for indecision.',
                type: 'triple_blank',
                options: ['(i) transparent', '(i) inscrutable', '(i) open', '(ii) flexible', '(ii) actual', '(ii) public', '(iii) clarity', '(iii) equivocation', '(iii) decisiveness'],
                correct_answer: [1, 4, 7],
                explanation: 'Revealing nothing and being mistaken for indecisive. "Inscrutable" (impossible to understand) demeanor hid "actual" position; her "equivocation" (ambiguity) seemed like indecision.',
                difficulty: 'hard'
            },
            {
                content: 'The theory\'s (i)_______ elegance—explaining diverse phenomena through a single principle—initially (ii)_______ researchers, but empirical testing has revealed (iii)_______ that complicate its apparently simple framework.',
                type: 'triple_blank',
                options: ['(i) clumsy', '(i) conceptual', '(i) practical', '(ii) repelled', '(ii) captivated', '(ii) bored', '(iii) confirmations', '(iii) anomalies', '(iii) validations'],
                correct_answer: [1, 4, 7],
                explanation: 'Simple elegance attracted then disappointed. "Conceptual" elegance initially "captivated" researchers, but testing revealed "anomalies" (irregularities) complicating the framework.',
                difficulty: 'hard'
            },
            {
                content: 'The author\'s (i)_______ prose—every word carefully weighed—demands (ii)_______ attention from readers but rewards such effort with insights that more (iii)_______ writing could never deliver.',
                type: 'triple_blank',
                options: ['(i) prolix', '(i) lapidary', '(i) verbose', '(ii) minimal', '(ii) sustained', '(ii) casual', '(iii) concise', '(iii) diffuse', '(iii) precise'],
                correct_answer: [1, 4, 7],
                explanation: 'Every word carefully weighed demands attention but rewards. "Lapidary" (elegant, precise) prose requires "sustained" attention; "diffuse" (spread out, wordy) writing couldn\'t match its insights.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s (i)_______ on the controversial issue—supporting it in private while opposing it publicly—eventually became (ii)_______ when leaked documents exposed the (iii)_______ between her stated and actual positions.',
                type: 'triple_blank',
                options: ['(i) consistency', '(i) duplicity', '(i) forthrightness', '(ii) irrelevant', '(ii) untenable', '(ii) strengthened', '(iii) harmony', '(iii) discrepancy', '(iii) agreement'],
                correct_answer: [1, 4, 7],
                explanation: 'Private support vs. public opposition is two-faced. "Duplicity" (deceitfulness) became "untenable" (impossible to maintain) when leaks exposed the "discrepancy" (difference) between positions.',
                difficulty: 'hard'
            },
            {
                content: 'The scientist\'s (i)_______ methodology—collecting data without preconceived hypotheses—has been (ii)_______ by critics who argue that truly (iii)_______ observation is impossible, as all perception is shaped by prior assumptions.',
                type: 'triple_blank',
                options: ['(i) hypothesis-driven', '(i) inductive', '(i) deductive', '(ii) praised', '(ii) challenged', '(ii) ignored', '(iii) biased', '(iii) objective', '(iii) subjective'],
                correct_answer: [1, 4, 7],
                explanation: 'Collecting data without hypotheses is inductive reasoning. "Inductive" methodology was "challenged" by critics who say truly "objective" observation is impossible.',
                difficulty: 'hard'
            },
            {
                content: 'The novel\'s (i)_______ narrative structure—presenting events out of chronological order—initially (ii)_______ readers but ultimately enhances their understanding by revealing how memory (iii)_______ experience.',
                type: 'triple_blank',
                options: ['(i) linear', '(i) fragmented', '(i) straightforward', '(ii) delights', '(ii) disorients', '(ii) bores', '(iii) accurately records', '(iii) distorts', '(iii) faithfully preserves'],
                correct_answer: [1, 4, 7],
                explanation: 'Out-of-order events create confusion. "Fragmented" structure initially "disorients" but shows how memory "distorts" experience.',
                difficulty: 'hard'
            },
            {
                content: 'The critic\'s (i)_______ dismissal of the film—rendered without engaging its actual content—exemplifies the (ii)_______ reviewing that has made audiences increasingly (iii)_______ of professional criticism.',
                type: 'triple_blank',
                options: ['(i) thoughtful', '(i) cursory', '(i) thorough', '(ii) rigorous', '(ii) lazy', '(ii) careful', '(iii) appreciative', '(iii) distrustful', '(iii) supportive'],
                correct_answer: [1, 4, 7],
                explanation: 'Dismissal without engaging content is superficial. "Cursory" (hasty) dismissal exemplifies "lazy" reviewing making audiences "distrustful" of critics.',
                difficulty: 'hard'
            },
            {
                content: 'The composer\'s (i)_______ incorporation of folk melodies into symphonic forms was initially deemed (ii)_______ by purists but is now recognized as a (iii)_______ synthesis that enriched both traditions.',
                type: 'triple_blank',
                options: ['(i) conventional', '(i) innovative', '(i) derivative', '(ii) masterful', '(ii) illegitimate', '(ii) traditional', '(iii) failed', '(iii) pioneering', '(iii) conventional'],
                correct_answer: [1, 4, 7],
                explanation: 'Combining folk and symphonic was new. "Innovative" incorporation was deemed "illegitimate" by purists but now seen as "pioneering" synthesis.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Triple Blanks - Hard Test 2',
        category: 'Triple Blanks',
        description: 'Expert-level passages with nuanced vocabulary.',
        time_limit_minutes: 20,
        questions: [
            {
                content: 'The historian\'s (i)_______ thesis—that the revolution was driven by economic rather than ideological factors—remains (ii)_______ despite decades of critique, a testament to the (iii)_______ of her archival research.',
                type: 'triple_blank',
                options: ['(i) conventional', '(i) provocative', '(i) uncontroversial', '(ii) discredited', '(ii) influential', '(ii) forgotten', '(iii) superficiality', '(iii) thoroughness', '(iii) inadequacy'],
                correct_answer: [1, 4, 7],
                explanation: 'A challenging thesis that endured. "Provocative" (stimulating debate) thesis remains "influential" despite critique, showing the "thoroughness" of her research.',
                difficulty: 'hard'
            },
            {
                content: 'The artist\'s (i)_______ style—characterized by deliberate crudeness and rejection of technical refinement—was (ii)_______ by academics but embraced by collectors who valued its (iii)_______ over conventional beauty.',
                type: 'triple_blank',
                options: ['(i) polished', '(i) primitivist', '(i) refined', '(ii) celebrated', '(ii) disdained', '(ii) imitated', '(iii) elegance', '(iii) rawness', '(iii) sophistication'],
                correct_answer: [1, 4, 7],
                explanation: 'Deliberate crudeness rejecting refinement. "Primitivist" style (deliberately unsophisticated) was "disdained" by academics but collectors valued its "rawness."',
                difficulty: 'hard'
            },
            {
                content: 'The executive\'s (i)_______ leadership during the crisis—making unilateral decisions without consulting stakeholders—was (ii)_______ by some as necessary decisiveness and by others as (iii)_______ disregard for institutional norms.',
                type: 'triple_blank',
                options: ['(i) collaborative', '(i) autocratic', '(i) democratic', '(ii) condemned', '(ii) praised', '(ii) ignored', '(iii) appropriate', '(iii) cavalier', '(iii) justified'],
                correct_answer: [1, 4, 7],
                explanation: 'Unilateral decisions without consulting. "Autocratic" leadership was "praised" by some as decisive, seen by others as "cavalier" (showing lack of proper concern) disregard.',
                difficulty: 'hard'
            },
            {
                content: 'The treaty\'s (i)_______ provisions, which seemed to favor the stronger party, were actually the result of (ii)_______ by the weaker nation\'s negotiators, who secured (iii)_______ concessions invisible to outside observers.',
                type: 'triple_blank',
                options: ['(i) equitable', '(i) one-sided', '(i) balanced', '(ii) incompetence', '(ii) shrewd maneuvering', '(ii) capitulation', '(iii) insignificant', '(iii) crucial', '(iii) minor'],
                correct_answer: [1, 4, 7],
                explanation: 'Apparent favoritism hiding different reality. "One-sided" provisions actually resulted from "shrewd maneuvering" that secured "crucial" hidden concessions.',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s (i)_______ writing style—dense with technical jargon and convoluted syntax—has (ii)_______ her ideas from wider dissemination, despite their potential (iii)_______ to contemporary debates.',
                type: 'triple_blank',
                options: ['(i) accessible', '(i) forbidding', '(i) inviting', '(ii) facilitated', '(ii) insulated', '(ii) promoted', '(iii) irrelevance', '(iii) relevance', '(iii) hostility'],
                correct_answer: [1, 4, 7],
                explanation: 'Dense jargon and syntax limits reach. "Forbidding" (intimidating) style "insulated" (protected/isolated) ideas from spread, despite their "relevance" to current debates.',
                difficulty: 'hard'
            },
            {
                content: 'The documentary\'s (i)_______ stance toward its controversial subject—declining to either condemn or exonerate—has been interpreted as (ii)_______ by critics who believe documentarians have a moral obligation to take (iii)_______ positions.',
                type: 'triple_blank',
                options: ['(i) judgmental', '(i) neutral', '(i) accusatory', '(ii) courageous', '(ii) cowardly', '(ii) innovative', '(iii) ambiguous', '(iii) unequivocal', '(iii) subtle'],
                correct_answer: [1, 4, 7],
                explanation: 'Not condemning or exonerating is neutral. "Neutral" stance seen as "cowardly" by those wanting "unequivocal" (clear, unambiguous) moral positions.',
                difficulty: 'hard'
            },
            {
                content: 'The researcher\'s (i)_______ findings—showing unexpected benefits from a previously condemned practice—were met with (ii)_______ by an establishment reluctant to admit that decades of (iii)_______ had been misguided.',
                type: 'triple_blank',
                options: ['(i) confirmatory', '(i) counterintuitive', '(i) expected', '(ii) enthusiasm', '(ii) hostility', '(ii) indifference', '(iii) research', '(iii) advocacy', '(iii) neutrality'],
                correct_answer: [1, 4, 7],
                explanation: 'Unexpected benefits from condemned practice. "Counterintuitive" findings met "hostility" from those unwilling to admit their "advocacy" against it was wrong.',
                difficulty: 'hard'
            },
            {
                content: 'The poet\'s (i)_______ imagery—juxtaposing incongruous elements—creates a sense of (ii)_______ that conventional verse rarely achieves, though some readers find such (iii)_______ more alienating than illuminating.',
                type: 'triple_blank',
                options: ['(i) conventional', '(i) surrealist', '(i) traditional', '(ii) comfort', '(ii) estrangement', '(ii) familiarity', '(iii) clarity', '(iii) disorientation', '(iii) simplicity'],
                correct_answer: [1, 4, 7],
                explanation: 'Juxtaposing incongruous elements is surrealistic. "Surrealist" imagery creates "estrangement" (alienation), though such "disorientation" alienates some readers.',
                difficulty: 'hard'
            },
            {
                content: 'The regime\'s (i)_______ of dissent—using surveillance rather than violence—proved more (ii)_______ than outright repression, as citizens learned to (iii)_______ themselves without explicit coercion.',
                type: 'triple_blank',
                options: ['(i) encouragement', '(i) subtle suppression', '(i) tolerance', '(ii) counterproductive', '(ii) effective', '(ii) visible', '(iii) express', '(iii) censor', '(iii) liberate'],
                correct_answer: [1, 4, 7],
                explanation: 'Surveillance rather than violence is subtle control. "Subtle suppression" proved more "effective" than violence as citizens learned to "censor" themselves.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s (i)_______ narrator—whose account of events proves unreliable—forces readers to become (ii)_______ interpreters, questioning assertions that more (iii)_______ narratives would present as fact.',
                type: 'triple_blank',
                options: ['(i) trustworthy', '(i) duplicitous', '(i) omniscient', '(ii) passive', '(ii) active', '(ii) uncritical', '(iii) conventional', '(iii) experimental', '(iii) innovative'],
                correct_answer: [1, 4, 7],
                explanation: 'Unreliable narrator requires reader engagement. "Duplicitous" (deceptive) narrator forces "active" interpretation; "conventional" narratives would present things as fact.',
                difficulty: 'hard'
            }
        ]
    }
];

async function seed() {
    console.log('Seeding HARD tests (Part 1: No Shift, Shift, Double Blank, Triple Blank)...\n');

    const allTests = [
        ...noShiftHard,
        ...shiftHard,
        ...doubleBlankHard,
        ...tripleBlankHard
    ];

    for (const test of allTests) {
        console.log(`Creating: ${test.title}`);

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
            console.error(`Error: ${testError.message}`);
            continue;
        }

        const questions = test.questions.map((q, index) => ({
            test_id: createdTest.id,
            content: q.content,
            type: q.type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            order_index: index + 1
        }));

        const { error: qError } = await supabase.from('questions').insert(questions);
        if (qError) console.error(`Questions error: ${qError.message}`);
        else console.log(`  ✓ ${questions.length} questions`);
    }

    console.log('\nPart 1 complete! Run seed_hard_tests_part2.ts for remaining categories.');
}

seed();
