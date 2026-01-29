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

    const { word, definition, words, sentence, mode = "evaluate" } = body;

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "generate") {
      systemPrompt = `You are a GRE tutor. Return a JSON object with exactly 3 professional example sentences for the word. Use the following JSON format:
FORMAT: {"examples": ["string", "string", "string"]}`;
      userPrompt = `Word: "${word}"\nDef: "${definition}"\nRespond in JSON format.`;
    } else if (mode === "quiz") {
      systemPrompt = `You are a GRE tutor. Generate a 5-question multiple choice quiz based on the provided list of GRE words.
Each question should test the meaning or usage of one of the words.
The format must be a JSON object containing an array of questions.
Each question must have:
- "content": The question text (e.g., a sentence with a blank or a "What is the meaning of..." question)
- "type": "single_choice"
- "options": An array of 4 strings
- "correct_answer": An array containing the index of the correct option (e.g., [1])
- "explanation": A brief explanation of why that's the correct answer

You MUST respond ONLY in JSON format: 
{"questions": [{"content": "...", "type": "single_choice", "options": ["...", "...", "...", "..."], "correct_answer": [0], "explanation": "..."}]}`;
      userPrompt = `Generate a quiz for these words:\n${words.map((w: any) => `- ${w.word}: ${w.definition}`).join('\n')}\nRespond in JSON format.`;
    } else if (mode === "rc") {
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
    } else {
      systemPrompt = `You are a GRE tutor. Evaluate the student's sentence and return the results in a JSON object. Respond in JSON format.
FORMAT: {"rating": "again"|"hard"|"good"|"easy", "feedback": "string", "suggestion": "string"|null, "examples": ["string", "string", "string"]}`;
      userPrompt = `Word: "${word}"\nDef: "${definition}"\nSentence: "${sentence}"\nRespond in JSON format.`;
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
