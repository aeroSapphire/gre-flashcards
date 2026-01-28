const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Always log invocation
  console.log(`Function called with method: ${req.method}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return new Response(
        JSON.stringify({ error: "API Key missing. Please add GEMINI_API_KEY to Supabase Project Secrets." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(e => {
      console.error("JSON Parse Error:", e);
      return null;
    });

    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { word, definition, sentence } = body;
    console.log(`Evaluating word: ${word}`);

    const prompt = `You are evaluating whether a GRE student correctly understands and uses a vocabulary word.

Word: "${word}"
Definition: "${definition}"
Student's sentence: "${sentence}"

Evaluate if the student's sentence demonstrates correct understanding and usage of the word "${word}".

Respond ONLY with valid JSON (no markdown, no code blocks):
{"isCorrect": true, "feedback": "Your explanation", "suggestion": null}
or
{"isCorrect": false, "feedback": "Your explanation", "suggestion": "Correct usage example"}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error(`Gemini Error (${geminiResponse.status}):`, errorData);
      return new Response(
        JSON.stringify({
          error: `Gemini API Error: ${geminiResponse.status}`,
          details: errorData.substring(0, 100)
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResponse.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return new Response(JSON.stringify({ error: "AI returned empty response" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Try to extract JSON
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error("Result Parse Error:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content.substring(0, 100) }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(
      JSON.stringify({
        isCorrect: !!result.isCorrect,
        feedback: result.feedback || "Checked!",
        suggestion: result.suggestion || null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Global Catch Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
