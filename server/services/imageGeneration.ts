import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an image of a friendly Irish nurse for the chatbot
 * @returns Base64 encoded image data
 */
export async function generateNurseImage(): Promise<string> {
  try {
    const cachePath = path.join(process.cwd(), "public", "fiona-nurse-avatar.png");
    
    // Check if we've already generated and cached the image
    if (fs.existsSync(cachePath)) {
      console.log("Using cached nurse image");
      const imageBuffer = fs.readFileSync(cachePath);
      return imageBuffer.toString("base64");
    }
    
    // Generate a new image if not cached
    console.log("Generating new nurse image with DALL-E");
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A friendly Irish female nurse with red hair, professional uniform with a teal accent, warm smile, against a white background. Realistic headshot portrait with a gentle, trustworthy expression. Digital illustration style, simple clean background.",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    // Get the base64 data
    if (!response.data || response.data.length === 0) {
      throw new Error("Invalid response from OpenAI image generation");
    }
    
    const firstImage = response.data[0];
    if (!firstImage || !firstImage.b64_json) {
      throw new Error("Invalid image data from OpenAI");
    }
    
    const imageData = response.data[0].b64_json;
    
    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Save the image to cache
    if (imageData) {
      fs.writeFileSync(cachePath, Buffer.from(imageData, "base64"));
    } else {
      throw new Error("No image data received from OpenAI");
    }
    
    return imageData;
  } catch (error) {
    console.error("Error generating nurse image:", error);
    throw new Error("Failed to generate nurse image. Please try again later.");
  }
}