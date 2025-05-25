export async function getLLMResponse(message: string, conversationId?: string | null) {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt: message, conversationId }),
  });
  return response.json();
} 
