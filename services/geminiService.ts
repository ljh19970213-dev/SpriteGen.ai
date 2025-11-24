import { GoogleGenAI } from "@google/genai";
import { AnimationType } from "../types";

// Helper to remove header from base64 if present
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/\w+;base64,/, "");

const PROMPTS: Record<AnimationType, (defaultFrames: number) => string> = {
  [AnimationType.WALK]: (frames) => 
    `Generate a horizontal sprite sheet of this character performing a front-facing walk cycle animation. 
    The output must contain exactly ${frames} distinct frames arranged in a single horizontal row with equal spacing.
    The character should step forward/backwards while facing the camera (2D front view).
    Maintain the exact style, colors, and proportions of the original character. 
    Background must be solid white or transparent.`,
  
  [AnimationType.JUMP]: (frames) => 
    `Generate a horizontal sprite sheet of this character performing a jump animation (idle -> crouch -> jump -> land -> idle). 
    The output must contain exactly ${frames} distinct frames arranged in a single horizontal row with equal spacing.
    Keep the character in front-view.
    Maintain the exact style, colors, and proportions of the original character.
    Background must be solid white or transparent.`,
  
  [AnimationType.IDLE]: (frames) => 
    `Generate a horizontal sprite sheet of this character performing an idle breathing animation.
    The output must contain exactly ${frames} distinct frames arranged in a single horizontal row with equal spacing.
    The motion should be subtle (chest rising/falling, slight swaying).
    Maintain the exact style, colors, and proportions of the original character.
    Background must be solid white or transparent.`,
};

export const generateSpriteSheet = async (
  inputImageBase64: string,
  type: AnimationType,
  targetFrames: number
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean the input string
  const cleanedInput = cleanBase64(inputImageBase64);

  const promptText = PROMPTS[type](targetFrames);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanedInput
            }
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K"
        }
      }
    });

    // Extract image from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
        throw new Error("No candidates returned from Gemini.");
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
        throw new Error("No content parts returned.");
    }

    // Find the image part
    const imagePart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));

    if (imagePart && imagePart.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data found in response.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate sprite sheet.");
  }
};