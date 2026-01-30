const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
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
    } else {

      systemPrompt = `You are a GRE tutor. Evaluate the student's sentence and return the results in a JSON object. Respond in JSON format.
FORMAT: {"rating": "again"|"hard"|"good"|"easy", "feedback": "string", "suggestion": "string"|null, "examples": ["string", "string", "string"]}`;
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
