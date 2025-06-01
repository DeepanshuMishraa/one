"use client"

import * as React from "react"
import { Calculator, Calendar, CreditCard, MessageCircle, QrCode, Settings, Smile, User, Menu } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChatCommand } from "./chat-command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [showChat, setShowChat] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleClose = () => {
    setOpen(false)
    setShowChat(false)
  }

  const handleOpenChat = () => {
    setShowChat(true)
    setOpen(true)
  }

  return (
    <>
      {/* Desktop keyboard shortcut hint */}
      {!isMobile && (
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </kbd>
        </p>
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      )}

      {/* Mobile chat button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={handleOpenChat}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">Open chat</span>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={handleClose}>
        {showChat ? (
          <ChatCommand onBack={() => setShowChat(false)} />
        ) : (
          <>
            <CommandInput placeholder="Type a command or search..." className="text-sm sm:text-base" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem onSelect={() => setShowChat(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Chat</span>
                </CommandItem>
                <CommandItem>
                  <QrCode className="mr-2 h-4 w-4" />
                  <span>Scan Calendar</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  {!isMobile && <CommandShortcut>⌘P</CommandShortcut>}
                </CommandItem>
                <CommandItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                  {!isMobile && <CommandShortcut>⌘B</CommandShortcut>}
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  {!isMobile && <CommandShortcut>⌘S</CommandShortcut>}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </>
        )}
      </CommandDialog>
    </>
  )
}
