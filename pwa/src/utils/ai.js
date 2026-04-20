import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API Key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Verifies if an image is a valid property/room photo using Gemini AI.
 * @param {string} base64String - The base64 data of the image.
 * @returns {Promise<boolean>} - True if valid, false otherwise.
 */
export const verifyPropertyImage = async (base64String) => {
  // Array of models to try in order of preference (2.5 Flash worked for you)
  const modelsToTry = [
    "gemini-2.5-flash", 
    "gemini-3.1-flash", 
    "gemini-3.1-flash-lite",
    "gemini-1.5-flash"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI verification with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Clean up base64 data for the API
      const base64Data = base64String.split(',')[1] || base64String;
      const mimeType = base64String.match(/data:(.*?);/)?.[1] || "image/jpeg";

      const prompt = `
        Task: Verify if this image is a real property, room, house, or building photo.
        
        Strict Rules:
        - Return 'VALID' only if it is a bedroom, kitchen, bathroom, building, gate, or common area.
        - Return 'INVALID' for memes, random objects, food, animals (like cats/dogs), or people without room context.
        
        Answer ONLY with the word VALID or INVALID.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const responseText = result.response.text().trim().toUpperCase();
      console.log(`AI result from ${modelName}:`, responseText);
      
      // FIX: Check for exact match to avoid "INVALID".includes("VALID") returning true
      return responseText === "VALID";
    } catch (error) {
      console.warn(`Model ${modelName} failed or not found:`, error.message);
      lastError = error;
      continue;
    }
  }

  // If all models failed
  console.error("All AI models failed verification.");
  throw lastError || new Error("AI Verification service unavailable.");
};
