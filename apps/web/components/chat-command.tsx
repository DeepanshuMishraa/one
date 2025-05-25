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

interface Message {
  type: "user" | "ai" | "tool-execution"
  content: string
  timestamp: Date
}

interface ChatCommandProps {
  onBack: () => void
}

interface APIResponse {
  content: string
  tool_calls: boolean
  error?: string
}

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
      if (response.tool_calls) {
        setMessages((prev) => [
          ...prev,
          {
            type: "tool-execution",
            content: "Checking your calendar...",
            timestamp: new Date(),
          },
        ])
      }
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: response.content,
          timestamp: new Date(),
        },
      ])
      setCurrentMessage("")
      scrollToBottom()
      inputRef.current?.focus()
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Failed to get response. Please try again.",
          timestamp: new Date(),
        },
      ])
      setCurrentMessage("")
      inputRef.current?.focus()
    },
  })

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
              <p className="text-xs mt-1">Type a message below to begin</p>
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
            {(message.type === "ai" || message.type === "tool-execution") && (
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
                      ? "bg-muted/50 text-foreground rounded-tl-none"
                      : "bg-muted text-foreground rounded-tl-none",
                )}
              >
                {message.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
            </div>

            {message.type === "user" && (
              <Avatar className="h-6 w-6 bg-primary">
                <Image src={session?.user?.image as string} alt={session?.user?.name.split(" ")[0] as string} width={24} height={24} />
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
              placeholder="Type a message..."
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
