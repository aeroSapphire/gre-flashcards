import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

// Test IDs - using deterministic UUIDs based on test names
// These are v5 UUID-like hashes to ensure consistency across runs
const SECTION_2_TEST_ID = '11111111-1111-1111-1111-111111111112';
const SECTION_3_TEST_ID = '11111111-1111-1111-1111-111111111113';

// ===============================
// SECTION 2 QUESTIONS (15 total)
// ===============================
const SECTION_2_QUESTIONS = [
    // Passage 1: James P. Johnson (Questions 1-3) - Reading Comprehension
    {
        content: `PASSAGE: James P. Johnson

Music critics have consistently defined James P. Johnson as a great early jazz pianist, originator of the 1920s Harlem "stride" style, and an important blues and jazz composer. In addition, however, Johnson was an innovator in classical music, composing symphonic music that incorporated American, and especially African American, traditions.

Such a blend of musical elements was not entirely new: by 1924 both Milhaud and Gershwin had composed classical works that incorporated elements of jazz. Johnson, a serious musician more experienced than most classical composers with jazz, blues, spirituals, and popular music, was particularly suited to expand Milhaud's and Gershwin's experiments. In 1927 he completed his first large-scale work, the blues- and jazz-inspired Yamekraw, which included borrowings from spirituals and Johnson's own popular songs. Yamekraw, premiered successfully in Carnegie Hall, was a major achievement for Johnson, becoming his most frequently performed extended work. It demonstrated vividly the possibility of assimilating contemporary popular music into the symphonic tradition.

---

QUESTION: The passage states that Johnson composed all of the following EXCEPT`,
        type: 'single_choice',
        options: [
            'jazz works',
            'popular songs',
            'symphonic music',
            'spirituals',
            'blues pieces'
        ],
        correct_answer: [3],
        explanation: `The passage says Yamekraw "included borrowings from spirituals" - meaning Johnson borrowed FROM spirituals, not that he composed them. The passage explicitly states he composed: jazz works ("important blues and jazz composer"), popular songs ("Johnson's own popular songs"), symphonic music ("composing symphonic music"), and blues pieces ("blues and jazz composer").`,
        order_index: 0,
        question_type: 'RC'
    },
    {
        content: `The author suggests which of the following about most classical composers of the early 1920s?

Select ALL that apply.`,
        type: 'multi_choice',
        options: [
            'They were strongly influenced by the musical experiments of Milhaud and Gershwin.',
            'They had little working familiarity with such forms of American music as jazz, blues, and popular songs.',
            'They made few attempts to introduce innovations into the classical symphonic tradition.'
        ],
        correct_answer: [1],
        explanation: `Only (B) is supported. The passage states Johnson was "more experienced than most classical composers with jazz, blues, spirituals, and popular music" - implying most classical composers had little experience with these forms. (A) is unsupported - no discussion of other composers' influences. (C) exceeds the passage's scope - it only discusses innovation in blending jazz/popular music, not classical innovation generally.`,
        order_index: 1,
        question_type: 'RC'
    },
    {
        content: `Which of the following best describes the organization of the passage?`,
        type: 'single_choice',
        options: [
            'A historical overview is presented, and a particular phenomenon is noted and analyzed.',
            'A popular belief is challenged, and a rival interpretation is presented and supported.',
            'A common viewpoint is presented and modified, and the modification is supported.',
            'An observation is made and rejected, and evidence for that rejection is presented.',
            'A common claim is investigated, and an alternative outlook is analyzed and criticized.'
        ],
        correct_answer: [2],
        explanation: `The passage presents a common viewpoint (Johnson as jazz/blues figure), then modifies it with "In addition, however" to include his classical work, then supports this modification with evidence (Yamekraw, Carnegie Hall). The key word "however" signals extension, not rejection - making (C) correct. Options suggesting "challenged," "rejected," or "criticized" misread the tone.`,
        order_index: 2,
        question_type: 'RC'
    },
    // Text Completion Questions (4-8)
    {
        content: `In the 1950s, the country's inhabitants were _______: most of them knew very little about foreign countries.`,
        type: 'single_choice',
        options: [
            'partisan',
            'erudite',
            'insular',
            'cosmopolitan',
            'imperturbable'
        ],
        correct_answer: [2],
        explanation: `The colon signals that the second clause explains the blank. We need a word meaning "knowing little about foreign countries." Insular (from Latin insula, "island") means narrow in outlook, isolated from outside influences - matching the definition given. Cosmopolitan (worldly) is the opposite. Erudite (learned) doesn't fit the context.`,
        order_index: 3,
        question_type: 'TC'
    },
    {
        content: `It is his dubious distinction to have proved what nobody would think of denying, that Romero at the age of sixty-four writes with all the characteristics of _______.`,
        type: 'single_choice',
        options: [
            'maturity',
            'fiction',
            'inventiveness',
            'art',
            'brilliance'
        ],
        correct_answer: [0],
        explanation: `This sentence is ironic. "Dubious distinction" and "proved what nobody would think of denying" indicate something obvious and unremarkable. At 64, writing with "maturity" is trivially true - the sarcasm is "Congratulations for proving an old person writes like an old person." Options like "brilliance" or "inventiveness" would be genuine praise, contradicting the ironic tone.`,
        order_index: 4,
        question_type: 'TC'
    },
    {
        content: `The narratives that vanquished peoples have created of their defeat have, according to Schivelbusch, fallen into several identifiable types. In one of these, the vanquished manage to (i)_______ the victor's triumph as the result of some spurious advantage, the victors being truly inferior where it counts. Often the winners (ii)_______ this interpretation, worrying about the cultural or moral costs of their triumph and so giving some credence to the losers' story.`,
        type: 'double_blank',
        options: [
            'Blank (i): construe',
            'Blank (i): anoint',
            'Blank (i): acknowledge',
            'Blank (ii): take issue with',
            'Blank (ii): disregard',
            'Blank (ii): collude in'
        ],
        correct_answer: [0, 5],
        explanation: `Blank (i): The vanquished "manage to [blank] the triumph as the result of spurious advantage" - they're reframing/interpreting it negatively. "Construe" (interpret) fits. "Acknowledge" suggests accepting, not reframing.

Blank (ii): Winners "[blank] this interpretation...giving credence to the losers' story." If they're giving credence, they support it. "Collude in" means secretly cooperate with. "Take issue with" (disagree) and "disregard" (ignore) contradict "giving credence."`,
        order_index: 5,
        question_type: 'TC'
    },
    {
        content: `I've long anticipated this retrospective of the artist's work, hoping that it would make (i)_______ judgments about him possible, but greater familiarity with his paintings highlights their inherent (ii)_______ and actually makes one's assessment (iii)_______.`,
        type: 'triple_blank',
        options: [
            'Blank (i): modish',
            'Blank (i): settled',
            'Blank (i): detached',
            'Blank (ii): gloom',
            'Blank (ii): ambiguity',
            'Blank (ii): delicacy',
            'Blank (iii): similarly equivocal',
            'Blank (iii): less sanguine',
            'Blank (iii): more cynical'
        ],
        correct_answer: [1, 4, 6],
        explanation: `Structure: "hoping X, but Y" = contrast. The speaker hoped for definitive judgments but got the opposite.

Blank (i): Hoped for "settled" (fixed, resolved) judgments.
Blank (ii): "Ambiguity" (uncertainty) frustrates the hope for settled judgments.
Blank (iii): "Similarly equivocal" - the paintings' ambiguity makes the assessment likewise uncertain.

"Less sanguine" (less optimistic) is about the wrong thing. "More cynical" doesn't follow from ambiguity.`,
        order_index: 6,
        question_type: 'TC'
    },
    {
        content: `Scientists are not the only persons who examine the world about them by the use of rational processes, although they sometimes (i)_______ this impression by extending the definition of "scientist" to include anyone who is (ii)_______ in his or her investigational practices.`,
        type: 'double_blank',
        options: [
            'Blank (i): conceal',
            'Blank (i): create',
            'Blank (i): undermine',
            'Blank (ii): intuitive',
            'Blank (ii): haphazard',
            'Blank (ii): logical'
        ],
        correct_answer: [1, 5],
        explanation: `The main claim: Scientists aren't the only rational people. The "although" introduces a complication - scientists sometimes do something that creates a contrary impression.

Blank (i): Scientists "create" the false impression that only they are rational (by their definition trick).
Blank (ii): They extend "scientist" to include anyone "logical" in their practices - making "rational person" and "scientist" synonymous, thus creating the misleading impression.`,
        order_index: 7,
        question_type: 'TC'
    },
    // Passage 2: Fuel Taxes (Questions 9-10) - Reading Comprehension
    {
        content: `PASSAGE: Fuel Taxes

The most plausible justification for higher taxes on automobile fuel is that fuel consumption harms the environment and thus adds to the costs of traffic congestion. But the fact that burning fuel creates these "negative externalities" does not imply that no tax on fuel could ever be too high. Economics is precise about the tax that should, in principle, be levied to deal with negative externalities: the tax on a liter of fuel should be equal to the harm caused by using a liter of fuel. If the tax is more than that, its costs (including the inconvenience to those who would rather have used their cars) will exceed its benefits (including any reduction in congestion and pollution).

---

QUESTION: Which of the following best characterizes the function of the boldfaced statement "the tax on a liter of fuel should be equal to the harm caused by using a liter of fuel"?`,
        type: 'single_choice',
        options: [
            'It restates a point made earlier in the passage.',
            'It provides the evidence on which a theory is based.',
            'It presents a specific application of a general principle.',
            'It summarizes a justification with which the author disagrees.',
            'It suggests that the benefits of a particular strategy have been overestimated.'
        ],
        correct_answer: [2],
        explanation: `The general principle: "Economics is precise about the tax that should be levied to deal with negative externalities." The boldfaced text applies this principle to the specific case of fuel taxes. It's not a restatement (A), not evidence (B), the author doesn't disagree (D), and it's not about overestimation (E).`,
        order_index: 8,
        question_type: 'RC'
    },
    {
        content: `In the passage, "exceed" most nearly means`,
        type: 'single_choice',
        options: [
            'outstrip',
            'magnify',
            'delimit',
            'offset',
            'supplant'
        ],
        correct_answer: [0],
        explanation: `Context: "its costs...will exceed its benefits." This describes costs becoming greater than benefits - a quantitative comparison. "Outstrip" means surpass or be greater than, preserving the meaning. "Magnify" (enlarge), "delimit" (set boundaries), "offset" (counterbalance), and "supplant" (replace) don't fit the comparison context.`,
        order_index: 9,
        question_type: 'RC'
    },
    // Passage 3: Ecosystems (Questions 11-12) - Reading Comprehension
    {
        content: `PASSAGE: Ecosystems

Objectively, of course, the various ecosystems that sustain life on the planet proceed independently of human agency, just as they operated before the hectic ascendancy of Homo sapiens. But it is also true that it is difficult to think of a single such system that has not, for better or worse, been substantially modified by human culture. Nor is this simply the work of the industrial centuries. It has been happening since the days of ancient Mesopotamia. It is coeval with the origins of writing, and has occurred throughout our social existence. And it is this irreversibly modified world, from the polar caps to the equatorial forests, that is all the nature we have.

---

QUESTION: It can be inferred from the passage that the author would agree with which of the following statements?

Select ALL that apply.`,
        type: 'multi_choice',
        options: [
            'Over time, the impact of human culture on the natural world has been largely benign.',
            'It is a mistake to think that the natural world contains many areas of pristine wilderness.',
            'The only substantial effects that human agency has had on ecosystems have been inadvertent.'
        ],
        correct_answer: [1],
        explanation: `(A) Incorrect: The passage says modifications occurred "for better or worse" - explicitly neutral about whether impact was benign.

(B) Correct: The passage states "it is difficult to think of a single such system that has not...been substantially modified" and the world is "irreversibly modified...from the polar caps to the equatorial forests." This implies no pristine wilderness exists.

(C) Incorrect: The passage never discusses intent (inadvertent vs. deliberate). "Human culture" suggests purposeful activity, but no claim is made either way.`,
        order_index: 10,
        question_type: 'RC'
    },
    {
        content: `The author mentions "ancient Mesopotamia" primarily in order to`,
        type: 'single_choice',
        options: [
            'provide some geographical and historical context for an earlier claim about the ascendancy of Homo sapiens',
            'support the idea that the impact of human culture on nature was roughly the same in the ancient world as in later times',
            'identify a place where the relationship between culture and nature was largely positive',
            'emphasize the extent to which the modification of nature by human culture preceded the industrial period',
            'make a connection between the origins of writing and other aspects of human cultural development'
        ],
        correct_answer: [3],
        explanation: `Context: "Nor is this simply the work of the industrial centuries. It has been happening since the days of ancient Mesopotamia." The reference directly follows the contrast with "industrial centuries" - showing modification happened much earlier. The explicit function is to counter the assumption that environmental modification is only industrial.`,
        order_index: 11,
        question_type: 'RC'
    },
    // Sentence Equivalence Questions (13-15)
    {
        content: `Dreams are _______ in and of themselves, but, when combined with other data, they can tell us much about the dreamer.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'astonishing',
            'disordered',
            'harmless',
            'inscrutable',
            'revealing',
            'uninformative'
        ],
        correct_answer: [3, 5],
        explanation: `Structure: "[Blank] in and of themselves, but...can tell us much." The "but" creates contrast: alone, dreams have quality X; combined with data, they're informative. Therefore, alone they must be NOT informative.

"Inscrutable" (impossible to understand) and "uninformative" (not providing useful information) both create the same meaning: dreams alone don't reveal information, but with other data, they do.`,
        order_index: 12,
        question_type: 'SE'
    },
    {
        content: `The macromolecule RNA is common to all living beings, and DNA, which is found in all organisms except some bacteria, is almost as _______.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'comprehensive',
            'fundamental',
            'inclusive',
            'universal',
            'significant',
            'ubiquitous'
        ],
        correct_answer: [3, 5],
        explanation: `Structure: RNA is "common to all living beings" → DNA is "almost as [blank]." The comparison is about distribution/presence across organisms.

"Universal" (present everywhere, applying to all) and "ubiquitous" (found everywhere, omnipresent) both mean "found everywhere" - matching "common to all living beings."

"Comprehensive" and "inclusive" relate to completeness, not presence. "Fundamental" and "significant" relate to importance, not distribution.`,
        order_index: 13,
        question_type: 'SE'
    },
    {
        content: `Early critics of Emily Dickinson's poetry mistook for simplemindedness the surface of artlessness that in fact she constructed with such _______.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'astonishment',
            'craft',
            'cunning',
            'innocence',
            'naivete',
            'vexation'
        ],
        correct_answer: [1, 2],
        explanation: `Structure: Critics "mistook for simplemindedness" what Dickinson "constructed with such [blank]." The sentence reveals that apparent "artlessness" was actually deliberately created. The blank must describe skill/intentionality.

"Craft" (skill in creating something) and "cunning" (cleverness, skill in achieving ends) both convey deliberate skill, creating the same ironic meaning: what seemed artless was skillfully crafted.

"Innocence" and "naivete" would support the critics' mistaken view. "Astonishment" and "vexation" are emotions, not descriptions of skill.`,
        order_index: 14,
        question_type: 'SE'
    }
];

// ===============================
// SECTION 3 QUESTIONS (20 total)
// ===============================
const SECTION_3_QUESTIONS = [
    // Sentence Equivalence Questions (1-4)
    {
        content: `In the long run, high-technology communications cannot _______ more traditional face-to-face family togetherness, in Ms. Aspinall's view.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'ameliorate',
            'compromise',
            'supersede',
            'approximate',
            'enervate',
            'supplant'
        ],
        correct_answer: [2, 5],
        explanation: `Context: Technology "cannot [blank] traditional face-to-face family togetherness." The sentence implies technology cannot replace or take the place of traditional togetherness.

"Supersede" (take the place of, replace) and "supplant" (replace, take the position of) both mean "replace," creating equivalent sentences.

"Ameliorate" = improve, "compromise" = weaken, "approximate" = come close to, "enervate" = weaken/drain energy - none create equivalent meanings.`,
        order_index: 0,
        question_type: 'SE'
    },
    {
        content: `Even in this business, where _______ is part of everyday life, a talent for lying is not something usually found on one's resume.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'aspiration',
            'mendacity',
            'prevarication',
            'insensitivity',
            'baseness',
            'avarice'
        ],
        correct_answer: [1, 2],
        explanation: `Structure: "[Blank] is part of everyday life" parallel to "talent for lying." The second clause references "lying," so the blank must relate to lying/dishonesty.

"Mendacity" (untruthfulness, lying) and "prevarication" (speaking evasively, lying) both refer to dishonesty, matching "lying."

"Aspiration" = ambition, "insensitivity" = lack of feeling, "baseness" = moral lowness (broader than lying), "avarice" = greed.`,
        order_index: 1,
        question_type: 'SE'
    },
    {
        content: `A restaurant's menu is generally reflected in its decor; however, despite this restaurant's _______ appearance it is pedestrian in the menu it offers.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'elegant',
            'tawdry',
            'modern',
            'traditional',
            'conventional',
            'chic'
        ],
        correct_answer: [0, 5],
        explanation: `Structure: "Menu reflected in decor; however, despite [blank] appearance, menu is pedestrian."

The "however" and "despite" create double contrast. The expectation: fancy decor → fancy menu. The reality: [blank] appearance but "pedestrian" (ordinary) menu.

For the contrast to work, the appearance must be impressive: "elegant" (refined, tasteful) and "chic" (stylish, fashionable) both describe upscale appearance contrasting with a pedestrian menu.

"Tawdry" = cheap (would match pedestrian). "Traditional/conventional" = ordinary (would match pedestrian).`,
        order_index: 2,
        question_type: 'SE'
    },
    {
        content: `International financial issues are typically _______ by the United States media because they are too technical to make snappy headlines and too inaccessible to people who lack a background in economics.

Select the TWO answer choices that produce sentences most alike in meaning.`,
        type: 'multi_choice',
        options: [
            'neglected',
            'slighted',
            'overrated',
            'hidden',
            'criticized',
            'repudiated'
        ],
        correct_answer: [0, 1],
        explanation: `Structure: Issues are [blank] "because they are too technical...and too inaccessible." The reasons explain why media doesn't cover these issues adequately - they're ignored.

"Neglected" (failed to give proper attention to) and "slighted" (treated as unimportant, given insufficient attention) both mean "given inadequate attention."

"Overrated" = given too much credit (opposite). "Hidden" = deliberately concealed (neglect isn't deliberate hiding). "Criticized/repudiated" = attacked (wrong direction).`,
        order_index: 3,
        question_type: 'SE'
    },
    // Passage 4: Political Newspapers (Questions 5-6) - Reading Comprehension
    {
        content: `PASSAGE: Political Newspapers

Scholarship on political newspapers and their editors is dominated by the view that as the United States grew, the increasing influence of the press led, ultimately, to the neutral reporting from which we benefit today. Pasley considers this view oversimplified, because neutrality was not a goal of early national newspaper editing, even when editors disingenuously stated that they aimed to tell all sides of a story. Rather, the intensely partisan ideologies represented in newspapers of the early republic led to a clear demarcation between traditional and republican values. The editors responsible for the papers' content—especially those with republican agendas—began to see themselves as central figures in the development of political consciousness in the United States.

---

QUESTION: The passage suggests that Pasley would agree with which of the following statements about the political role of newspapers?

Select ALL that apply.`,
        type: 'multi_choice',
        options: [
            'Newspapers today are in many cases much less neutral in their political reporting than is commonly held by scholars.',
            'Newspapers in the early United States normally declared quite openly their refusal to tell all sides of most political stories.',
            'The editorial policies of some early United States newspapers became a counterweight to proponents of traditional values.'
        ],
        correct_answer: [2],
        explanation: `(A) Incorrect: Pasley's argument is about early newspapers, not modern ones. The passage doesn't address current neutrality.

(B) Incorrect: The passage says editors "disingenuously stated that they aimed to tell all sides" - meaning they CLAIMED neutrality but didn't practice it. They did NOT "openly" refuse; they falsely claimed balance.

(C) Correct: Partisan newspapers "led to a clear demarcation between traditional and republican values" and editors with "republican agendas" saw themselves as developing political consciousness. Republican newspapers opposed traditional values - a "counterweight."`,
        order_index: 4,
        question_type: 'RC'
    },
    {
        content: `In the passage, "disingenuously" most nearly means`,
        type: 'single_choice',
        options: [
            'insincerely',
            'guilelessly',
            'obliquely',
            'resolutely',
            'pertinaciously'
        ],
        correct_answer: [0],
        explanation: `Context: "neutrality was not a goal...even when editors disingenuously stated that they aimed to tell all sides."

The sentence structure reveals: editors said they wanted neutrality, but neutrality wasn't actually their goal. Their statements were false/insincere.

"Insincerely" (not genuinely, falsely) fits perfectly. "Guilelessly" (innocently, without deception) is the opposite. "Obliquely" (indirectly), "resolutely" (with determination), and "pertinaciously" (stubbornly) don't fit the meaning.`,
        order_index: 5,
        question_type: 'RC'
    },
    // Text Completion Questions (7-10)
    {
        content: `The (i)_______ nature of classical tragedy in Athens belies the modern image of tragedy: in the modern view tragedy is austere and stripped down, its representations of ideological and emotional conflicts so superbly compressed that there's nothing (ii)_______ for time to erode.`,
        type: 'double_blank',
        options: [
            'Blank (i): unadorned',
            'Blank (i): harmonious',
            'Blank (i): multifaceted',
            'Blank (ii): inalienable',
            'Blank (ii): exigent',
            'Blank (ii): extraneous'
        ],
        correct_answer: [2, 5],
        explanation: `Structure: "[Blank i] nature...belies the modern image" - "belies" means contradicts. So classical tragedy's nature contradicts the modern view that tragedy is "austere and stripped down."

Blank (i): Must be opposite of "austere and stripped down." "Multifaceted" (having many aspects) contradicts "stripped down."

Blank (ii): Modern tragedy is "so compressed that there's nothing [blank] for time to erode." If compressed with no excess, there's nothing extra. "Extraneous" (irrelevant, unnecessary) fits.

"Inalienable" = cannot be taken away (wrong meaning). "Exigent" = urgent (wrong meaning).`,
        order_index: 6,
        question_type: 'TC'
    },
    {
        content: `Murray, whose show of recent paintings and drawings is her best in many years, has been eminent hereabouts for a quarter century, although often regarded with (i)_______, but the most (ii)_______ of these paintings (iii)_______ all doubts.`,
        type: 'triple_blank',
        options: [
            'Blank (i): partiality',
            'Blank (i): credulity',
            'Blank (i): ambivalence',
            'Blank (ii): problematic',
            'Blank (ii): successful',
            'Blank (ii): disparaged',
            'Blank (iii): exculpate',
            'Blank (iii): assuage',
            'Blank (iii): whet'
        ],
        correct_answer: [2, 4, 7],
        explanation: `Structure: "eminent...although regarded with [i], but the most [ii] paintings [iii] all doubts." The "although...but" signals: despite some reservation, the best work overcomes it.

Blank (i): "Although...regarded with [blank]" - suggests mixed/negative reception despite eminence. "Ambivalence" (mixed feelings) fits.

Blank (ii): "The most [blank] of these paintings" - must be positive (these overcome doubts). "Successful" fits.

Blank (iii): "Paintings [blank] all doubts" - "Assuage" (relieve, ease) works. "Exculpate" (clear of blame) takes wrong objects. "Whet" (sharpen) would increase doubts.`,
        order_index: 7,
        question_type: 'TC'
    },
    {
        content: `Far from viewing Jefferson as a skeptical but enlightened intellectual, historians of the 1960s portrayed him as _______ thinker, eager to fill the young with his political orthodoxy while censoring ideas he did not like.`,
        type: 'single_choice',
        options: [
            'an adventurous',
            'a doctrinaire',
            'an eclectic',
            'a judicious',
            'a cynical'
        ],
        correct_answer: [1],
        explanation: `Structure: "Far from [positive view]...portrayed him as [blank]...eager to fill [others] with orthodoxy while censoring."

"Far from" signals contrast with "skeptical but enlightened." The description ("fill with orthodoxy," "censoring ideas") describes someone rigidly ideological.

"Doctrinaire" (rigidly devoted to a doctrine, dogmatic) matches "orthodoxy" and "censoring." "Adventurous" and "eclectic" suggest openness (contradicts "censoring"). "Judicious" is positive. "Cynical" doesn't match "fill with orthodoxy."`,
        order_index: 8,
        question_type: 'TC'
    },
    {
        content: `Dramatic literature often _______ the history of a culture in that it takes as its subject matter the important events that have shaped and guided the culture.`,
        type: 'single_choice',
        options: [
            'confounds',
            'repudiates',
            'recapitulates',
            'anticipates',
            'polarizes'
        ],
        correct_answer: [2],
        explanation: `Structure: Drama "[blank] history...in that it takes as subject matter the important events."

"In that" = because/since. Drama does [blank] to history because it represents important historical events. The blank must mean "represents" or "retells."

"Recapitulates" (summarizes, goes through again) - drama re-presents history. "Confounds" = confuses. "Repudiates" = rejects (contradicts "takes as subject matter"). "Anticipates" = comes before (drama follows history). "Polarizes" = divides.`,
        order_index: 9,
        question_type: 'TC'
    },
    // Passage 5: A Raisin in the Sun (Questions 11-14) - Reading Comprehension
    {
        content: `PASSAGE: A Raisin in the Sun

In A Raisin in the Sun, Lorraine Hansberry does not reject integration or the economic and moral promise of the American dream; rather, she remains loyal to this dream while looking, realistically, at its incomplete realization. Once we recognize this dual vision, we can accept the play's ironic nuances as deliberate social commentaries by Hansberry rather than as the "unintentional" irony that Bigsby attributes to the work. Indeed, a curiously persistent refusal to credit Hansberry with a capacity for intentional irony has led some critics to interpret the play's thematic conflicts as mere confusion, contradiction, or eclecticism. Isaacs, for example, cannot easily reconcile Hansberry's intense concern for her race with her ideal of human reconciliation. But the play's complex view of Black self-esteem and human solidarity as compatible is no more "contradictory" than Du Bois' famous, well-considered ideal of ethnic self-awareness coexisting with human unity, or Fanon's emphasis on an ideal internationalism that also accommodates national identities and roles.

---

QUESTION: The author's primary purpose in the passage is to`,
        type: 'single_choice',
        options: [
            "explain some critics' refusal to consider A Raisin in the Sun a deliberately ironic play",
            "suggest that ironic nuances ally A Raisin in the Sun with Du Bois' and Fanon's writings",
            'analyze the fundamental dramatic conflicts in A Raisin in the Sun',
            'emphasize the inclusion of contradictory elements in A Raisin in the Sun',
            'affirm the thematic coherence underlying A Raisin in the Sun'
        ],
        correct_answer: [4],
        explanation: `The author argues that apparent contradictions are actually coherent - they're "compatible" and "no more contradictory than" respected thinkers' ideas. The purpose is to affirm coherence.

(A) The passage doesn't primarily explain WHY critics refuse - it argues against their view.
(B) Du Bois and Fanon are analogies supporting the argument, not the main point.
(C) The passage doesn't analyze the conflicts themselves - it defends their coherence.
(D) The author argues AGAINST seeing contradictions - this is the critics' view, not the author's.`,
        order_index: 10,
        question_type: 'RC'
    },
    {
        content: `The author of the passage would probably consider which of the following judgments to be most similar to the reasoning of the critics described in the passage who refuse to credit Hansberry with intentional irony?`,
        type: 'single_choice',
        options: [
            'The world is certainly flat; therefore, the person proposing to sail around it is unquestionably foolhardy.',
            'Radioactivity cannot be directly perceived; therefore, a scientist could not possibly control it in a laboratory.',
            "The painter of this picture could not intend it to be funny; therefore, its humor must result from a lack of skill.",
            'Traditional social mores are beneficial to culture; therefore, anyone who deviates from them acts destructively.',
            'Filmmakers who produce documentaries deal exclusively with facts; therefore, a filmmaker who reinterprets particular events is misleading us.'
        ],
        correct_answer: [2],
        explanation: `The critics' reasoning: "Refusal to credit Hansberry with a capacity for intentional irony has led some critics to interpret the play's thematic conflicts as mere confusion."

Logic: Hansberry couldn't intend irony → so irony must be unintentional/accidental → apparent sophistication is actually confusion.

(C) matches: Painter couldn't intend humor → humor must result from lack of skill (accident). Both deny the creator's intentionality and attribute the effect to accident/incompetence.`,
        order_index: 11,
        question_type: 'RC'
    },
    {
        content: `Which sentence in the passage provides examples that reinforce an argument against a critical response cited earlier?`,
        type: 'single_choice',
        options: [
            '"In A Raisin in the Sun..."',
            '"Once we recognize..."',
            '"Indeed, a curiously persistent refusal..."',
            '"Isaacs, for example..."',
            '"But the play\'s complex view..."'
        ],
        correct_answer: [4],
        explanation: `The question asks for: examples that reinforce an argument AGAINST a critical response.

The sentence "But the play's complex view of Black self-esteem and human solidarity as compatible is no more 'contradictory' than Du Bois' famous, well-considered ideal of ethnic self-awareness coexisting with human unity, or Fanon's emphasis..."

This sentence:
- Argues AGAINST the critics' claim of contradiction
- Provides EXAMPLES (Du Bois, Fanon) that parallel Hansberry's approach
- Shows that similar "dual" commitments are respected in other thinkers`,
        order_index: 12,
        question_type: 'RC'
    },
    {
        content: `It can be inferred from the passage that the author believes which of the following about Hansberry's use of irony in A Raisin in the Sun?

Select ALL that apply.`,
        type: 'multi_choice',
        options: [
            "It reflects Hansberry's reservations about the extent to which the American dream has been realized.",
            "It is justified by Hansberry's loyalty to a favorable depiction of American life.",
            "It shows in the play's thematic conflicts."
        ],
        correct_answer: [0, 2],
        explanation: `(A) Correct: The passage states Hansberry "remains loyal to this dream while looking, realistically, at its incomplete realization." The irony reflects this "incomplete realization" - her reservations about achievement of the dream.

(B) Incorrect: The irony isn't "justified by loyalty to favorable depiction" - Hansberry's view is more nuanced. The irony comes from the gap between ideal and reality, not from favorable depiction.

(C) Correct: The passage explicitly states "we can accept the play's ironic nuances as deliberate social commentaries" and discusses how critics misread "the play's thematic conflicts" as confusion when they're actually intentional irony.`,
        order_index: 13,
        question_type: 'RC'
    },
    // Critical Reasoning Question (15)
    {
        content: `As an example of the devastation wrought on music publishers by the photocopier, one executive noted that for a recent choral festival with 1,200 singers, the festival's organizing committee purchased only 12 copies of the music published by her company that was performed as part of the festival.

Which of the following, if true, most seriously weakens the support the example lends to the executive's contention that music publishers have been devastated by the photocopier?`,
        type: 'single_choice',
        options: [
            "Only a third of the 1,200 singers were involved in performing the music published by the executive's company.",
            'Half of the singers at the festival had already heard the music they were to perform before they began to practice for the festival.',
            'Because of shortages in funding, the organizing committee of the choral festival required singers to purchase their own copies of the music performed at the festival.',
            'Each copy of music that was performed at the festival was shared by two singers.',
            'As a result of publicity generated by its performance at the festival, the type of music performed at the festival became more widely known.'
        ],
        correct_answer: [2],
        explanation: `The executive's argument: 1,200 singers, only 12 copies purchased by the committee → must mean photocopying filled the gap → photocopiers devastate publishers.

Hidden assumption: The 12 copies purchased by the committee were the only copies used.

(C) undermines this: If singers were required to purchase their own copies, then the committee's 12 copies don't represent total purchases. Singers may have bought hundreds more copies.

(A) Even 400 singers using 12 copies suggests photocopying. (B) Having heard music doesn't mean they don't need sheets. (D) Sharing still only accounts for 24 singers. (E) Future publicity doesn't address photocopying.`,
        order_index: 14,
        question_type: 'CR'
    },
    // Text Completion Questions (16-17)
    {
        content: `New technologies often begin by (i)_______ what has gone before, and they change the world later. Think how long it took power-using companies to recognize that with electricity they did not need to cluster their machinery around the power source, as in the days of steam. Instead, power could be (ii)_______ their processes. In that sense, many of today's computer networks are still in the steam age. Their full potential remains unrealized.`,
        type: 'double_blank',
        options: [
            'Blank (i): uprooting',
            'Blank (i): dismissing',
            'Blank (i): mimicking',
            'Blank (ii): transmitted to',
            'Blank (ii): consolidated around',
            'Blank (ii): incorporated into'
        ],
        correct_answer: [2, 5],
        explanation: `Blank (i): "New technologies often begin by [blank] what has gone before." The example shows companies initially used electricity like steam (clustered around power source) - they copied old patterns. "Mimicking" (imitating) fits. "Uprooting" (displacing) contradicts "begin by" - full disruption comes "later."

Blank (ii): "Power could be [blank] their processes." The revolutionary insight was electricity could be distributed throughout processes. "Incorporated into" (integrated into) fits. "Consolidated around" is the OLD steam model.`,
        order_index: 15,
        question_type: 'TC'
    },
    {
        content: `Of course anyone who has ever perused an unmodernized text of Captain Clark's journals knows that the Captain was one of the most (i)_______ spellers ever to write in English, but despite this (ii)_______ orthographical rules, Clark is never unclear.`,
        type: 'double_blank',
        options: [
            'Blank (i): indefatigable',
            'Blank (i): fastidious',
            'Blank (i): defiant',
            'Blank (ii): disregard for',
            'Blank (ii): partiality toward',
            'Blank (ii): unpretentiousness about'
        ],
        correct_answer: [0, 3],
        explanation: `Context: Clark was a notably bad speller. The "but...never unclear" signals that despite spelling problems, his writing is clear.

Blank (i): "One of the most [blank] spellers" - must describe his bad/inconsistent spelling. "Indefatigable" (tireless, persistent) works ironically: he tirelessly misspelled! "Fastidious" (meticulous) contradicts bad spelling.

Blank (ii): "Despite this [blank] orthographical rules" - describes his relationship to spelling rules: he ignored them. "Disregard for" (lack of attention to) fits. "Partiality toward" (fondness for) contradicts bad spelling.`,
        order_index: 16,
        question_type: 'TC'
    },
    // Critical Reasoning Question (18)
    {
        content: `For the past two years at FasCorp, there has been a policy to advertise any job opening to current employees and to give no job to an applicant from outside the company if a FasCorp employee applies who is qualified for the job. This policy has been strictly followed, yet even though numerous employees of FasCorp have been qualified for any given entry-level position, some entry-level jobs have been filled with people from outside the company.

If the information provided is true, which of the following must on the basis of it also be true about FasCorp during the past two years?`,
        type: 'single_choice',
        options: [
            'There have been some open jobs for which no qualified FasCorp employee applied.',
            'Some entry-level job openings have not been advertised to FasCorp employees.',
            'The total number of employees has increased.',
            'FasCorp has hired some people for jobs for which they were not qualified.',
            'All the job openings have been for entry-level jobs.'
        ],
        correct_answer: [0],
        explanation: `Given facts:
1. Policy: Advertise all jobs internally; give jobs to qualified internal applicants over external ones
2. Policy strictly followed
3. Many employees qualified for any entry-level position
4. Yet some entry-level jobs filled by outsiders

The puzzle: If qualified employees exist AND policy prioritizes them, why were outsiders hired?

Resolution: The only way to hire an outsider while strictly following the policy is if no qualified employee APPLIED. The policy says "if a FasCorp employee applies who is qualified" - no application = no priority.

(A) must be true: For outsiders to be hired, no qualified employee could have applied.
(B) Contradicts "policy strictly followed." (C) Not necessarily implied. (D) Not implied. (E) Not stated.`,
        order_index: 17,
        question_type: 'CR'
    },
    // Passage 6: Tree Water Transport (Questions 19-20) - Reading Comprehension
    {
        content: `PASSAGE: Tree Water Transport

A tall tree can transport a hundred gallons of water a day from its roots deep underground to the treetop. Is this movement propelled by pulling the water from above or pushing it from below? The pull mechanism has long been favored by most scientists. First proposed in the late 1800s, the theory relies on a property of water not commonly associated with fluids: its tensile strength. Instead of making a clean break, water evaporating from treetops tugs on the remaining water molecules, with that tug extending from molecule to molecule all the way down to the roots. The tree itself does not actually push or pull; all the energy for lifting water comes from the sun's evaporative power.

---

QUESTION: Which of the following statements is supported by the passage?

Select ALL that apply.`,
        type: 'multi_choice',
        options: [
            'The pull theory is not universally accepted by scientists.',
            "The pull theory depends on one of water's physical properties.",
            'The pull theory originated earlier than did the push theory.'
        ],
        correct_answer: [0, 1],
        explanation: `(A) Correct: The passage says "the pull mechanism has long been favored by most scientists." "Most" (not "all") implies some scientists don't accept it - it's not universal.

(B) Correct: The passage explicitly states "the theory relies on a property of water not commonly associated with fluids: its tensile strength." Tensile strength is a physical property of water.

(C) Not Supported: The passage only gives the origin date of the pull theory ("late 1800s"). It says nothing about when the push theory originated. We cannot infer which came first.`,
        order_index: 18,
        question_type: 'RC'
    },
    {
        content: `The passage provides information on each of the following EXCEPT`,
        type: 'single_choice',
        options: [
            'when the pull theory originated',
            'the amount of water a tall tree can transport',
            'the significance of water\'s tensile strength in the pull theory',
            'the role of the sun in the pull theory',
            'the mechanism underlying water\'s tensile strength'
        ],
        correct_answer: [4],
        explanation: `Let's verify each option:

(A) Provided: "First proposed in the late 1800s"
(B) Provided: "A tall tree can transport a hundred gallons of water a day"
(C) Provided: "the theory relies on a property of water...its tensile strength" + explanation of how it works
(D) Provided: "all the energy for lifting water comes from the sun's evaporative power"
(E) NOT Provided: The passage describes WHAT tensile strength does (allows water molecules to tug on each other) but never explains WHY water has tensile strength or what molecular/physical mechanism creates this property.`,
        order_index: 19,
        question_type: 'RC'
    }
];

async function seedGREPracticeTest1() {
    console.log('🚀 Seeding GRE Practice Test 1...\n');

    // First, run the migration to create tests
    console.log('📝 Creating test entries...');

    // Delete existing questions for these tests (to allow re-running)
    const { error: deleteError1 } = await supabase
        .from('questions')
        .delete()
        .eq('test_id', SECTION_2_TEST_ID);

    const { error: deleteError2 } = await supabase
        .from('questions')
        .delete()
        .eq('test_id', SECTION_3_TEST_ID);

    if (deleteError1) console.log('Note: Could not delete existing Section 2 questions:', deleteError1.message);
    if (deleteError2) console.log('Note: Could not delete existing Section 3 questions:', deleteError2.message);

    // Insert Section 2 test
    const { error: test2Error } = await supabase
        .from('tests')
        .upsert({
            id: SECTION_2_TEST_ID,
            title: 'GRE Practice Test 1 - Verbal Section 2',
            category: 'GRE Full Test',
            description: 'Official GRE-style verbal reasoning section with 15 questions. Includes Reading Comprehension, Text Completion, and Sentence Equivalence questions.',
            time_limit_minutes: 18,
            question_count: 15,
            difficulty: 'medium'
        }, { onConflict: 'id' });

    if (test2Error) {
        console.error('❌ Failed to create Section 2 test:', test2Error);
        return;
    }
    console.log('✅ Section 2 test created');

    // Insert Section 3 test
    const { error: test3Error } = await supabase
        .from('tests')
        .upsert({
            id: SECTION_3_TEST_ID,
            title: 'GRE Practice Test 1 - Verbal Section 3',
            category: 'GRE Full Test',
            description: 'Official GRE-style verbal reasoning section with 20 questions. Includes Reading Comprehension, Text Completion, Sentence Equivalence, and Critical Reasoning questions.',
            time_limit_minutes: 23,
            question_count: 20,
            difficulty: 'medium'
        }, { onConflict: 'id' });

    if (test3Error) {
        console.error('❌ Failed to create Section 3 test:', test3Error);
        return;
    }
    console.log('✅ Section 3 test created');

    // Insert Section 2 questions
    console.log('\n📝 Inserting Section 2 questions...');
    const section2Questions = SECTION_2_QUESTIONS.map(q => ({
        test_id: SECTION_2_TEST_ID,
        content: q.content,
        type: q.type,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index
    }));

    const { error: q2Error } = await supabase
        .from('questions')
        .insert(section2Questions);

    if (q2Error) {
        console.error('❌ Failed to insert Section 2 questions:', q2Error);
    } else {
        console.log(`✅ Inserted ${section2Questions.length} Section 2 questions`);
    }

    // Insert Section 3 questions
    console.log('\n📝 Inserting Section 3 questions...');
    const section3Questions = SECTION_3_QUESTIONS.map(q => ({
        test_id: SECTION_3_TEST_ID,
        content: q.content,
        type: q.type,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: q.order_index
    }));

    const { error: q3Error } = await supabase
        .from('questions')
        .insert(section3Questions);

    if (q3Error) {
        console.error('❌ Failed to insert Section 3 questions:', q3Error);
    } else {
        console.log(`✅ Inserted ${section3Questions.length} Section 3 questions`);
    }

    console.log('\n✨ GRE Practice Test 1 seeding complete!');
    console.log(`   - Section 2: ${section2Questions.length} questions (18 min)`);
    console.log(`   - Section 3: ${section3Questions.length} questions (23 min)`);
    console.log(`   - Total: ${section2Questions.length + section3Questions.length} questions`);
}

seedGREPracticeTest1();
