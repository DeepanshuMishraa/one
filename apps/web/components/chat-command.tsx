"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import { CommandInput } from "@/components/ui/command"
import { getLLMResponse } from "@/lib/llm"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"
import { useSession } from "@repo/auth/client"
import { type ChatCommandProps, type Message, type APIResponse, type ToolResult } from "@repo/types"


export function ChatCommand({ onBack }: ChatCommandProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = React.useState("")
  const chatContainerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isSmallScreen = useMediaQuery("(max-width: 640px)")
  const { data: session } = useSession()

  const { mutate: sendMessage, isPending } = useMutation<APIResponse, Error, string>({
    mutationFn: async (message: string) => {
      const response = await getLLMResponse(message)
      if (response.error) {
        throw new Error(response.error)
      }
      return response
    },
    onSuccess: (response) => {
      console.log("Received response:", response)

      // Handle tool execution
      if (response.hasToolCalls && response.toolCalls.length > 0) {
        // Add tool execution message
        setMessages((prev) => [
          ...prev,
          {
            type: "tool-execution",
            content: getToolExecutionMessage(response?.toolCalls[0]?.toolName || "Unknown tool"),
            timestamp: new Date(),
          },
        ])

        // Process tool results
        if (response.toolResults && response.toolResults.length > 0) {
          response.toolResults.forEach((toolResult) => {
            const resultContent = formatToolResult(toolResult)
            if (resultContent) {
              setMessages((prev) => [
                ...prev,
                {
                  type: "tool-result",
                  content: resultContent,
                  timestamp: new Date(),
                  toolData: toolResult.result,
                },
              ])
            }
          })
        }
      }
      if (response.content && response.content.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: response.content,
            timestamp: new Date(),
          },
        ])
      }

      setCurrentMessage("")
      scrollToBottom()
      inputRef.current?.focus()
    },
    onError: (error: Error) => {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        },
      ])
      setCurrentMessage("")
      inputRef.current?.focus()
    },
  })

  const getToolExecutionMessage = (toolName: string): string => {
    switch (toolName) {
      case "getWeather":
        return "Getting weather..."
      case "getCalendarEvents":
        return "Checking calendar..."
      default:
        return "Processing..."
    }
  }

  const formatToolResult = (toolResult: ToolResult): string | null => {
    if (toolResult.toolName === "getWeather") {
      const weather = toolResult.result

      if (weather.error) {
        return `Unable to fetch weather data: ${weather.error}`
      }

      return `${weather.location}, ${weather.country}
${weather.temperature}°C • ${weather.condition}
Feels like ${weather.feelsLike}°C • ${weather.humidity}% humidity
Wind ${weather.windSpeed} km/h`
    }

    if (toolResult.toolName === "getCalendarEvents") {
      const calendarData = toolResult.result

      if (calendarData.error) {
        return `${calendarData.message || calendarData.error}`
      }

      if (!calendarData.events || calendarData.events.length === 0) {
        return `${calendarData.message}`
      }

      let result = `${calendarData.message}\n\n`

      calendarData.events.forEach((event: any, index: number) => {
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)
        const startTime = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const endTime = endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const dateStr = startDate.toLocaleDateString([], { month: "short", day: "numeric" })

        result += `${event.title}\n`
        result += `${dateStr} • ${startTime} - ${endTime}`

        if (event.location && event.location !== "No location specified") {
          result += ` • ${event.location}`
        }

        if (event.description && event.description !== "No description") {
          result += `\n${event.description}`
        }

        if (event.attendees && event.attendees.length > 0) {
          result += `\nWith ${event.attendees.map((a: any) => a.name).join(", ")}`
        }

        if (index < calendarData.events.length - 1) {
          result += "\n\n"
        }
      })

      return result
    }

    return null
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!currentMessage.trim() || isPending) return

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: currentMessage,
        timestamp: new Date(),
      },
    ])
    sendMessage(currentMessage)
    scrollToBottom()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessageContent = (message: Message) => {
    if (message.type === "tool-result") {
      return <div className="whitespace-pre-line text-sm">{message.content}</div>
    }
    return message.content
  }

  return (
    <div className="flex flex-col h-full md:h-[550px] bg-background rounded-lg border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} size="icon" variant="ghost" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h2 className="text-sm font-medium">Chat with One</h2>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Start a conversation</p>
              <p className="text-xs mt-1">Ask me about the weather, your calendar, or anything else!</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
              message.type === "user" ? "justify-end" : "justify-start",
            )}
          >
            {(message.type === "ai" || message.type === "tool-execution" || message.type === "tool-result") && (
              <Avatar className="h-6 w-6 bg-primary/10">
                <Image src="/logo.svg" alt="logo" width={24} height={24} />
              </Avatar>
            )}

            <div className="flex flex-col gap-1">
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : message.type === "tool-execution"
                      ? "bg-muted/30 text-muted-foreground rounded-tl-none italic"
                      : message.type === "tool-result"
                        ? "bg-muted/50 text-foreground rounded-tl-none font-mono text-xs leading-relaxed"
                        : "bg-muted text-foreground rounded-tl-none",
                )}
              >
                {renderMessageContent(message)}
              </div>
              <span className="text-[10px] text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
            </div>

            {message.type === "user" && (
              <Avatar className="h-6 w-6 bg-primary">
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt={session?.user?.name?.split(" ")[0] || "User"}
                  width={24}
                  height={24}
                />
              </Avatar>
            )}
          </div>
        ))}

        {isPending && (
          <div className="flex items-start gap-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
            <Avatar className="h-6 w-6 bg-primary/10">
              <Image src="/logo.svg" alt="logo" width={24} height={24} />
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2.5">
              <div className="flex gap-1 items-center">
                <div className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <CommandInput
              ref={inputRef}
              autoFocus
              placeholder="Ask about weather, calendar, or anything else..."
              value={currentMessage}
              onValueChange={setCurrentMessage}
              onKeyDown={handleKeyDown}
              className="pr-10 py-2.5 rounded-full border-muted-foreground/20"
            />
          </div>
          <Button
            type="submit"
            size={isSmallScreen ? "icon" : "default"}
            disabled={isPending || !currentMessage.trim()}
            className="rounded-full h-10 transition-all"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                {!isSmallScreen && <span className="ml-2">Send</span>}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
