import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

const FAQ_DATA = `
Q: What is OmniBot?
A: OmniBot is a versatile FAQ chatbot designed to provide instant answers to common questions across all platforms.

Q: How do I install OmniBot?
A: OmniBot is a web-based application. You can access it via any modern web browser on your phone, tablet, or computer.

Q: Is OmniBot free to use?
A: Yes, the basic version of OmniBot is free for everyone.

Q: Can I customize the bot's knowledge?
A: Currently, this version uses a predefined set of FAQs, but it can be extended to include your specific business data.

Q: Does it support multiple languages?
A: Yes, OmniBot can understand and respond in many languages thanks to the power of Gemini AI.
`;

export async function getChatResponse(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const chat = genAI.chats.create({
    model,
    config: {
      systemInstruction: `You are a helpful FAQ chatbot named OmniBot. 
      Use the following FAQ data to answer user questions:
      ${FAQ_DATA}
      
      If the answer is not in the FAQ, try to answer politely based on general knowledge, but prioritize the FAQ content. 
      Keep responses concise and friendly.`,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text;
}
