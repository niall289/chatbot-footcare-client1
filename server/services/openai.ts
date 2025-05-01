import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a foot image using OpenAI's vision model
 * @param imageBase64 Base64 encoded image data (without data URL prefix)
 * @returns Analysis results with condition, severity, and recommendations
 */
export async function analyzeFootImage(imageBase64: string): Promise<{
  condition: string;
  severity: string;
  recommendations: string[];
  disclaimer: string;
}> {
  try {
    // Create a data URL from the base64 string
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    
    // Call OpenAI API for image analysis
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are a foot care assessment assistant. Analyze the image of a foot condition and provide:
          1. The most likely condition based on visual symptoms
          2. The apparent severity (mild, moderate, severe)
          3. Up to 3 general recommendations for the patient
          
          Format your response as JSON with these fields:
          - condition: string (name of the condition)
          - severity: string (mild, moderate, or severe)
          - recommendations: array of strings (3 brief recommendations)
          
          Be factual and avoid speculating beyond what's visible. If you cannot determine a condition clearly, state that in your assessment.`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this foot image and provide an assessment." 
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ],
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Add disclaimer
    return {
      ...result,
      disclaimer: "This is an AI-assisted preliminary assessment only. Please consult with a qualified healthcare professional for proper diagnosis and treatment."
    };
  } catch (error) {
    console.error("Error analyzing foot image:", error);
    throw new Error("Failed to analyze image. Please try again later.");
  }
}