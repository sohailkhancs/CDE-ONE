
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getConstructionAdvice = async (query: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional Construction Project Manager AI assistant. 
      Answer the following query based on common industry standards (ISO 19650, AIA, RIBA, LEED).
      Context: ${context || 'General construction site management'}
      Query: ${query}`,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again later.";
  }
};
