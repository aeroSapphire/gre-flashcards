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
    let geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API Key" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    geminiApiKey = geminiApiKey.trim();

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "No body" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { word, definition, sentence } = body;

    const prompt = `You are evaluating a GRE student's understanding of a vocabulary word based on the sentence they wrote.

Word: "${word}"
Definition: "${definition}"
Student's sentence: "${sentence}"

Rate the student's understanding and assign an SRS rating:
- "again": Sentence is wrong, doesn't use the word, or shows misunderstanding
- "hard": Sentence is technically correct but awkward, vague, or shows weak understanding
- "good": Sentence correctly demonstrates understanding of the word
- "easy": Sentence shows excellent, nuanced understanding with sophisticated usage

Respond ONLY with valid JSON:
{"rating": "again"|"hard"|"good"|"easy", "feedback": "brief encouraging feedback", "suggestion": "example sentence if rating is again or hard, otherwise null"}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini Error ${response.status}`, details: errorText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean and Parse AI response
    let result;
    try {
      // Find the JSON object in case AI wrapped it in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      result = { error: "Parse error", raw: content };
    }

    // CRITICAL: Ensure we return an object, not a string
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
