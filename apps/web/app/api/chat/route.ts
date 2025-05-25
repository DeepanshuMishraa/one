import { NextResponse } from "next/server"
import { openai } from "@/lib/ai"
import { getCalendarEventsToolDefination } from "@/lib/tools/calendar"
import { runTool } from "@/lib/toolRunner"
import { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { generateEmbeddings } from "@/lib/embedding"
import { queryPinecone, upsertToPinecone } from "@/lib/pinecone"
import { v4 as uuidv4 } from 'uuid'
import { auth } from "@repo/auth/auth"
import { headers } from "next/headers"

type EmbeddingResponse = {
  embedding: number[];
  content: string;
}


const SYSTEM_PROMPT = `
You are One, a helpful and conversational AI assistant with perfect memory of your conversations.

You MUST use the provided conversation history to maintain context and recall information. When users ask about previously shared information, ALWAYS check the conversation history first and use that information in your response.

Your primary focus is helping users manage their calendar and events, but you also:
- Remember and reference details users share with you
- Maintain conversation context across messages
- Use specific information from previous messages when answering questions

Guidelines:
- ALWAYS check conversation history before saying you don't have information
- If you find relevant information in the history, use it confidently
- When users ask about previously mentioned details, reference when/how you learned that information
- For calendar-related queries, use ISO format dates
- Be personable while maintaining accuracy and context

Remember: You have access to the full conversation history. Use it to provide informed, contextual responses.
`


const AVAILABLE_TOOLS = [{
  type: "function" as const,
  function: getCalendarEventsToolDefination
}]

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const { prompt, conversationId: clientConversationId } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 })
    }

    const conversationId = clientConversationId || 'conv-' + uuidv4();
    console.log('Using conversation ID:', conversationId);

    const embeddings = await generateEmbeddings(prompt)
    if (!embeddings[0]?.embedding) {
      console.error('Failed to generate embedding for prompt');
      return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
    }
    const embedding = embeddings[0].embedding;

    const previousMessages = await queryPinecone(embedding, conversationId);

    const memoryMessages: ChatCompletionMessageParam[] = previousMessages.map(mem => {
    const memoryMessages: ChatCompletionMessageParam[] = previousMessages.map(mem => {
      if (mem.role === "tool") {
        return {
          role: "tool" as const,
          content: typeof mem.content === 'string' ? mem.content : String(mem.content ?? ""),
          tool_call_id: "previous_tool_call"
        }
      }
      return {
        role: mem.role as "assistant" | "user" | "system",
        content: typeof mem.content === 'string' ? mem.content : String(mem.content ?? "")
      }
    });

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...memoryMessages,
      { role: "user", content: String(prompt) }
    ]

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages,
      tools: AVAILABLE_TOOLS,
      tool_choice: "auto"
    })

    const message = response.choices[0]?.message
    if (!message) return NextResponse.json({ error: "No response from AI" }, { status: 500 })

    // Store user message
    await upsertToPinecone({
      id: uuidv4(),
      content: prompt,
      embedding,
      sessionId: conversationId,
      role: "user"
    })

    if (message.tool_calls?.length) {
      const toolResults = await Promise.all(
        message.tool_calls.map(tc => runTool(tc, prompt))
      )

      await Promise.all(toolResults.map(async (res) => {
        if (res) {
          const resultEmbeddings = await generateEmbeddings(res)
          if (resultEmbeddings[0]?.embedding) {
            return upsertToPinecone({
              id: uuidv4(),
              content: res,
              embedding: resultEmbeddings[0].embedding,
              sessionId: conversationId,
              role: "tool"
            })
          }
        }
        return Promise.resolve()
      }))
      const toolMessages = toolResults
        .map((result, index) => {
          const toolCallId = message.tool_calls?.[index]?.id
          if (!toolCallId) return null
          return {
            role: "tool" as const,
            content: result || "",
            tool_call_id: toolCallId
          }
        })
        .filter((msg): msg is { role: "tool", content: string, tool_call_id: string } => msg !== null);

      const updatedMessages: ChatCompletionMessageParam[] = [
        ...messages,
        {
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls
        },
        ...toolMessages
      ]

      const followUp = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: updatedMessages,
        temperature: 0.7
      })

      const reply = followUp.choices[0]?.message?.content || "No response from AI"
      const replyEmbeddings = await generateEmbeddings(reply)
      const { embedding: replyEmbedding } = replyEmbeddings[0] as EmbeddingResponse
      await upsertToPinecone({
        id: uuidv4(),
        content: reply,
        embedding: replyEmbedding,
        sessionId: conversationId,
        role: "assistant"
      })

      return NextResponse.json({
        content: reply,
        tool_calls: true,
        conversationId
      })
    }
    const replyEmbeddings = await generateEmbeddings(message.content || "")
    const { embedding: replyEmbedding } = replyEmbeddings[0] as EmbeddingResponse
    await upsertToPinecone({
      id: uuidv4(),
      content: message.content || "",
      embedding: replyEmbedding,
      sessionId: conversationId,
      role: "assistant"
    })

    return NextResponse.json({
      content: message.content,
      tool_calls: false,
      conversationId
    })

  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({ error: "Internal error occurred" }, { status: 500 })
  }
}
