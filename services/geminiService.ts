import { GoogleGenAI } from "@google/genai";
import { Player, Role } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateGameCommentary = async (
  players: Player[], 
  winner: Role.MANTRI | Role.CHOR, 
  mantriName: string, 
  chorName: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Great game! (API Key missing for AI commentary)";

  const model = "gemini-2.5-flash";
  
  let prompt = "";
  if (winner === Role.MANTRI) {
    prompt = `The Mantri (${mantriName}) correctly caught the Chor (${chorName})! The Kingdom is safe. Give a short, witty, celebratory comment in the style of a Bollywood movie announcer or a royal herald. Max 2 sentences.`;
  } else {
    prompt = `The Mantri (${mantriName}) FAILED to catch the Chor (${chorName})! The thief escaped with the loot! Roast the Mantri for being incompetent in a funny, lighthearted way. Max 2 sentences.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a witty, energetic game commentator for the Indian card game Raja Mantri Chor Sipahi.",
        temperature: 0.9,
      }
    });
    return response.text || "What a match!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Royal Scribe is currently away (AI Error). But great game!";
  }
};