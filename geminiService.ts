
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

export const analyzeWordProblem = async (problem: string): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following percentage-related math problem and extract the core numbers and calculation type.
    
    Problem: "${problem}"
    
    Calculation Types Mapping:
    - "BASIC_OF": Finding X% of Y
    - "IS_WHAT": X is what % of Y?
    - "CHANGE": Percentage increase/decrease from X to Y
    - "ADD_SUB": Adding or subtracting X% to/from Y
    
    Format the response as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The calculation type from the mapping above."
          },
          inputs: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "The numbers extracted for calculation."
          },
          explanation: {
            type: Type.STRING,
            description: "A short human-friendly explanation of the logic."
          },
          suggestedAction: {
            type: Type.STRING,
            description: "What calculation needs to be performed."
          }
        },
        required: ["type", "inputs", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as AIAnalysis;
  } catch (error) {
    throw new Error("Failed to parse AI response");
  }
};
