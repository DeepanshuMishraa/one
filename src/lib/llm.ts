import { openai } from "./ai";

export const GenerateResponse = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      {
        role: "system",
        content:
          "You are One , A AI that helps people interact with their calendar, you are able to answer questions, schedule events, and help with reminders.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
};
