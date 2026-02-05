
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, MODEL_NAME } from "../constants";
import { ConversionType } from "../types";

export class GeminiService {
  static getModelName(): string {
    return MODEL_NAME;
  }

  static async convert(type: ConversionType, content: string): Promise<string> {
    // Create new instance before each call to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const today = new Date().toISOString().split('T')[0];
    const instructionSource = SYSTEM_INSTRUCTIONS[type];
    const instruction = typeof instructionSource === 'function' 
      ? instructionSource(today) 
      : instructionSource;
    
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: content,
        config: {
          systemInstruction: instruction,
          temperature: 0.1, // Lower temperature for more accurate translation
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      const text = response.text || '';
      // Cleanup markdown code blocks if the model wrapped them
      return text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
    } catch (error) {
      console.error("Gemini conversion failed:", error);
      // Re-throw to let App.tsx handle specific errors like project not found
      throw error;
    }
  }
}
