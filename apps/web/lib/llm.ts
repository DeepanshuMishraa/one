import { zodFunction } from "openai/helpers/zod"

export const getLLMResponse = async (prompt: string, tools: any[]) => {
  const formattedTools = tools.map(zodFunction)
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, tools: formattedTools }),
  })

  if (!response.ok) {
    throw new Error("Failed to get AI response")
  }

  const data = await response.json()
  return data.content
} 
