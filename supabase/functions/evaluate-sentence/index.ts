import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    console.log("Request received:", req.method, req.url);
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GROQ_API_KEY" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: "No body" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { word, definition, part_of_speech, words, sentence, mode = "evaluate" } = body;

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "generate") {
      systemPrompt = `You are a GRE tutor. Return a JSON object with exactly 3 professional example sentences for the word. Use the following JSON format:
FORMAT: {"examples": ["string", "string", "string"]}`;
      userPrompt = `Word: "${word}"\nPOS: "${part_of_speech || 'N/A'}"\nDef: "${definition}"\nRespond in JSON format.`;
    } else if (mode === "quiz") {
      // ... same as before but could include POS if words had it
      systemPrompt = `You are a GRE tutor. Generate a 5-question multiple choice quiz based on the provided list of GRE words.
Each question should test the meaning or usage of one of the words.
The word being quizzed MUST be highlighted by wrapping it in double asterisks (e.g., **word** or **vocabulary**).
The format must be a JSON object containing an array of questions.
Each question must have:
- "content": The question text (e.g., "The **laconic** speaker was known for his...")
- "type": "single_choice"
- "options": An array of 4 strings
- "correct_answer": An array containing the index of the correct option (e.g., [1])
- "explanation": A brief explanation of why that's the correct answer

You MUST respond ONLY in JSON format: 
{"questions": [{"content": "...", "type": "single_choice", "options": ["...", "...", "...", "..."], "correct_answer": [0], "explanation": "..."}]}`;
      userPrompt = `Generate a quiz for these words:\n${words.map((w: any) => `- ${w.word} (${w.part_of_speech || ''}): ${w.definition}`).join('\n')}\nRespond in JSON format.`;
    } else if (mode === "rc") {
      // ... same
      systemPrompt = `You are a GRE tutor. Generate 3 professional GRE-style Reading Comprehension questions based on the provided passage.
The questions should test main idea, inference, or specific details.
The format must be a JSON object containing an array of questions.
Each question must have:
- "content": The question text
- "type": "single_choice"
- "options": An array of 5 options
- "correct_answer": An array containing the index of the correct option (e.g., [1])
- "explanation": A brief explanation of why that's the correct answer

You MUST respond ONLY in JSON format: 
{"questions": [{"content": "...", "type": "single_choice", "options": ["...", "...", "...", "...", "..."], "correct_answer": [0], "explanation": "..."}]}`;
      userPrompt = `Passage:\n"${sentence}"\n\nGenerate 3 questions for this passage in JSON format.`;
    } else if (mode === "enrich") {
      systemPrompt = `You are a GRE tutor. Identify the part of speech (noun, verb, adjective, adverb, or other) for the given word based on its word and definition. Return a JSON object correctly formatted.
FORMAT: {"part_of_speech": "noun"|"verb"|"adjective"|"adverb"|"other"}`;
      userPrompt = `Word: "${word}"\nDef: "${definition}"\nRespond in JSON format.`;
    } else if (mode === "etymology-challenge") {
      systemPrompt = `You are a GRE tutor specializing in etymology. Generate a challenge for the student based on a root they just learned.
Identify a sophisticated GRE word that uses the given root but is NOT in the provided list.
The format must be a JSON object:
- "word": The new GRE word
- "options": 4 definitions (one correct)
- "correct_index": index of correct option
- "breakdown": How the root helps define this specific word

YOU MUST respond ONLY in JSON format: 
{"word": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "breakdown": "..."}`;
      userPrompt = `Root: "${body.root}"\nMeaning: "${body.root_meaning}"\nExisting Words: ${JSON.stringify(body.existing_words)}\nRespond in JSON format.`;
    } else if (mode === "etymology") {
      systemPrompt = `You are an expert etymologist and GRE tutor. Provide a detailed etymological breakdown for the given GRE word.

Your response must include:
1. The language of origin (Latin, Greek, French, Old English, etc.)
2. The root word(s) with their meanings
3. A brief explanation of how the literal meaning connects to the modern definition

YOU MUST ALWAYS PROVIDE A RESULT. Use your extensive linguistic knowledge.

FORMAT: {"etymology": "derives from [Language] [root]: [breakdown]. [Literal meaning explanation connecting to modern usage]."}
EXAMPLE: {"etymology": "derives from Latin circumspectus: circum (around) + spectare (to look/watch). Literally 'looking around,' it suggests careful observation of one's surroundings before acting."}`;
      userPrompt = `Word: "${word}"\nDefinition: "${definition}"\nRespond ONLY in JSON format.`;
    } else if (mode === "word-connections") {
      systemPrompt = `You are a GRE vocabulary expert. Analyze the given word and identify:
1. Synonyms: Words from the provided vocabulary list that have similar meanings
2. Antonyms: Words from the provided vocabulary list that have opposite meanings
3. Related Roots: Any common etymological roots shared with other words in the list

IMPORTANT: Only include words that are ACTUALLY in the provided vocabulary list. Do not invent words.
If no matches exist, return empty arrays.

FORMAT: {"synonyms": ["word1", "word2"], "antonyms": ["word3"], "related_roots": ["word4", "word5"]}`;
      userPrompt = `Target Word: "${word}"\nDefinition: "${definition}"\nVocabulary List: ${JSON.stringify(body.vocabulary_list)}\nRespond ONLY in JSON format.`;
    } else if (mode === "classify-mistake") {
      const { questionType, questionText, options, correctAnswer, userAnswer } = body;
      
      systemPrompt = `You are a GRE Verbal error classifier.

Your task is NOT to teach, motivate, or explain broadly.
Your task is to classify the user's mistake as precisely as possible.

You must choose exactly ONE label from the list below:
POLARITY_ERROR
INTENSITY_MISMATCH
SCOPE_ERROR
LOGICAL_CONTRADICTION
TONE_REGISTER_MISMATCH
TEMPORAL_ERROR
PARTIAL_SYNONYM_TRAP
DOUBLE_NEGATIVE_CONFUSION
CONTEXT_MISREAD
ELIMINATION_FAILURE
NONE

Rules:
- Do NOT invent new labels.
- Do NOT use multiple labels.
- If multiple issues exist, choose the MOST FUNDAMENTAL error.
- Output must be valid JSON.
- Explanations must be ONE sentence, max 20 words.
- No advice. No examples. No extra text.

Interpretation guidance:
- POLARITY_ERROR: user chose a word with opposite meaning.
- INTENSITY_MISMATCH: correct direction but too strong/weak.
- SCOPE_ERROR: meaning applies too broadly or narrowly.
- PARTIAL_SYNONYM_TRAP: similar meaning but fails in this context.
- ELIMINATION_FAILURE: user kept an option that should have been eliminated easily.
- CONTEXT_MISREAD: user misunderstood sentence logic or intent.

If the user's answer is correct, return:
{ "label": "NONE", "explanation": "Answer is correct." }`;

      userPrompt = `QUESTION_TYPE: ${questionType}

QUESTION:
${questionText}

OPTIONS:
${Array.isArray(options) ? options.join('\n') : options}

CORRECT_ANSWER:
${Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer}

USER_ANSWER:
${Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer}`;
    } else if (mode === "generate-targeted-practice") {
      const { mistakeLabel } = body;

      systemPrompt = `You are an expert GRE Verbal test creator (ETS style).
Your goal is to create 3 HIGH-DIFFICULTY practice questions specifically designed to fix a student's weakness.

WEAKNESS TYPE: ${mistakeLabel}

GENERAL RULES:
- Vocabulary must be ADVANCED (GRE tier).
- Sentences must be complex, academic, and syntactically dense.
- Distractors (wrong answers) must be plausible to a careless reader.
- Avoid simple, short sentences. Use compound-complex structures.

INSTRUCTIONS PER WEAKNESS:
- POLARITY_ERROR: Create Text Completion (TC) questions with subtle contrast signals (e.g., "belies," "antithetical," "notwithstanding") or double-negatives. The blank must require identifying a shift in meaning.
- INTENSITY_MISMATCH: Create TC questions where options have nearly identical definitions but differ in STRENGTH (e.g., "dislike" vs "loathe", "smart" vs "ingenious"). Context must dictate the extreme or moderate choice.
- SCOPE_ERROR: Create Reading Comprehension (RC) style mini-passages (2-3 sentences) where the correct answer is strictly supported by the text, while the "trap" answer is slightly too broad or makes an unsupported inference.
- LOGICAL_CONTRADICTION: Create TC questions where the wrong answer creates a paradox or oxymoron in context.
- TONE_REGISTER_MISMATCH: Create TC questions requiring a specific formality level or academic tone.
- PARTIAL_SYNONYM_TRAP: Create Sentence Equivalence (SE) questions with "near synonyms" that don't fit the specific context (collocation errors or nuance differences).
- DEFAULT: If the label is generic, create a mix of hard TC and SE questions.

OUTPUT FORMAT:
Return a JSON object with an array of "questions".
Each question must have:
- "content": The question text (use _____ for blanks).
- "type": "single_choice" or "multi_choice" (for SE).
- "options": Array of strings (4-5 options).
- "correct_answer": Array of indices [0] or [0, 1].
- "explanation": Detailed explanation of why the correct answer fits and specifically why the "trap" answer (related to the weakness) is wrong.

EXAMPLE JSON (Complex Polarity):
{
  "questions": [
    {
      "content": "Far from being a ________ figure, the director was actually quite accessible, often engaging in lively debates with his detractors.",
      "type": "single_choice",
      "options": ["aloof", "gregarious", "cantankerous", "solicitous", "reclusive"],
      "correct_answer": [0, 4], 
      "explanation": "The phrase 'Far from being' sets up a contrast with 'accessible' and 'engaging'. We need a word that means distant or unapproachable. 'Aloof' and 'reclusive' fit this description perfectly."
    }
  ]
}`;
      userPrompt = `Generate 3 GRE-level practice questions for weakness: ${mistakeLabel}. Make them difficult. Respond in JSON format.`;
    } else {
      // Default evaluation mode
      // Check if examples should be included (default to true for backward compatibility)
      const includeExamples = body.include_examples !== false;
      
      const exampleField = includeExamples ? ', "examples": ["string", "string", "string"]' : '';

      systemPrompt = `You are a GRE tutor. Evaluate the student's sentence and return the results in a JSON object. Respond in JSON format.
FORMAT: {"rating": "again"|"hard"|"good"|"easy", "feedback": "string", "suggestion": "string"|null${exampleField}}`;
      userPrompt = `Word: "${word}"\nPOS: "${part_of_speech || 'N/A'}"\nDef: "${definition}"\nSentence: "${sentence}"\nRespond in JSON format.`;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: "API Failure", details: errorText }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    return new Response(data.choices?.[0]?.message?.content || "{}", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
