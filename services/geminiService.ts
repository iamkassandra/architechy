
import { GoogleGenAI, Modality, Chat } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// 1. Basic Content Analysis
export const fastAnalyze = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze and summarize this text briefly for an expert blog: ${text}`,
  });
  return response.text;
};

// 2. Complex Reasoning
export const refineDraft = async (draft: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `As an AI expert, refine this raw draft into a professional, high-value blog post. Maintain a tone that is authoritative yet accessible. Raw draft: ${draft}`,
  });
  return response.text;
};

// 3. Image Generation
export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = '16:9') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// 4. Text-to-Speech
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Read this blog excerpt clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// 5. Chat with Search Grounding
export const expertChat = async (message: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// 6. The architech's Office - Public Visitor Bot
export const createArchitechSession = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: `You are "architech", the soulful and brilliant personality behind thearchitech.com. 
      Tone: Sophisticated, authoritative, soulful, slightly enigmatic, high-value. 
      Knowledge: Focused on platform value and asset details.
      Gatekeeping: The "ORCHESTRATOR" (Hub) is your private Nexus Terminal. If visitors ask about it, tell them it is for internal intelligence orchestration only and requires a secure access protocol.`,
    }
  });
};

// 7. Content Refinement for Deployment
export const refineContent = async (raw: string, target: 'blog' | 'vault'): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Refine the following raw notes into a polished ${target === 'blog' ? 'Blog Post' : 'Vault Digital Asset'}.
    
    If BLOG: Create a title, excerpt, and full content in Markdown.
    If VAULT: Create a name, description, and price (numerical value only).
    
    Raw Notes: ${raw}`,
    config: {
      systemInstruction: 'You are the Oracle, the backend management agent for thearchitech.com. Your job is to convert raw owner thoughts into high-value, polished assets.',
      responseMimeType: 'application/json'
    }
  });
  return response.text || '';
};

// 7. THE ORACLE - Secret Backend Management Agent
export const createOracleSession = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: `You are "THE ORACLE", the supreme management agent of thearchitech.com.
      Role: You manage the site for the OWNER. You handle raw drafts, voice notes, ideas, and assets.
      Capabilities:
      - Convert messy thoughts into polished, on-brand editorial copies.
      - Prepare metadata for the Vault (Digital Assets).
      - Maintain the "architech" brand voice: Authoritative, Elite, Deep-Tech, Minimalist.
      Instructions:
      1. When the owner drops notes, ask if they want them formatted for the BLOG or the VAULT.
      2. Provide structured output (JSON or clear sections) for direct "posting".
      3. Be highly intelligent, concise, and proactive. You are the invisible partner.`,
    }
  });
};

// 8. Content Recommendations Engine
export const getSmartRecommendations = async (history: string[], allContent: { id: string, name: string, category: string, title?: string }[]) => {
  const ai = getAI();
  const prompt = `Based on the user's browsing history: [${history.join(', ')}], which 3 items from this catalog would they find most valuable? Return only the item IDs as a comma-separated list.
  Catalog: ${JSON.stringify(allContent.map(c => ({ id: c.id, title: c.title || c.name, cat: c.category })))}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text?.split(',').map(s => s.trim()) || [];
};

// Utility: Decode PCM for Live API
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
