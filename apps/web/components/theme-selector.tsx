"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Theme {
  name: string
  id: string
  preview: string
  variables: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

const themes: Theme[] = [
  {
    name: "Claude",
    id: "claude",
    preview: "/placeholder.svg?height=120&width=120&text=Claude+Theme",
    variables: {
      light: {
        "--background": "oklch(1.0000 0 0)",
        "--foreground": "oklch(0.3211 0 0)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.3211 0 0)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.3211 0 0)",
        "--primary": "oklch(0.6231 0.1880 259.8145)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9670 0.0029 264.5419)",
        "--secondary-foreground": "oklch(0.4461 0.0263 256.8018)",
        "--muted": "oklch(0.9846 0.0017 247.8389)",
        "--muted-foreground": "oklch(0.5510 0.0234 264.3637)",
        "--accent": "oklch(0.9514 0.0250 236.8242)",
        "--accent-foreground": "oklch(0.3791 0.1378 265.5222)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.9276 0.0058 264.5313)",
        "--input": "oklch(0.9276 0.0058 264.5313)",
        "--ring": "oklch(0.6231 0.1880 259.8145)",
      },
      dark: {
        "--background": "oklch(0.2046 0 0)",
        "--foreground": "oklch(0.9219 0 0)",
        "--card": "oklch(0.2686 0 0)",
        "--card-foreground": "oklch(0.9219 0 0)",
        "--popover": "oklch(0.2686 0 0)",
        "--popover-foreground": "oklch(0.9219 0 0)",
        "--primary": "oklch(0.6231 0.1880 259.8145)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.2686 0 0)",
        "--secondary-foreground": "oklch(0.9219 0 0)",
        "--muted": "oklch(0.2686 0 0)",
        "--muted-foreground": "oklch(0.7155 0 0)",
        "--accent": "oklch(0.3791 0.1378 265.5222)",
        "--accent-foreground": "oklch(0.8823 0.0571 254.1284)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3715 0 0)",
        "--input": "oklch(0.3715 0 0)",
        "--ring": "oklch(0.6231 0.1880 259.8145)",
      },
    },
  },
  {
    name: "Modern",
    id: "modern",
    preview: "/placeholder.svg?height=120&width=120&text=Modern+Theme",
    variables: {
      light: {
        "--background": "oklch(1.0000 0 0)",
        "--foreground": "oklch(0.2686 0 0)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.2686 0 0)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.2686 0 0)",
        "--primary": "oklch(0.7686 0.1647 70.0804)",
        "--primary-foreground": "oklch(0 0 0)",
        "--secondary": "oklch(0.9670 0.0029 264.5419)",
        "--secondary-foreground": "oklch(0.4461 0.0263 256.8018)",
        "--muted": "oklch(0.9846 0.0017 247.8389)",
        "--muted-foreground": "oklch(0.5510 0.0234 264.3637)",
        "--accent": "oklch(0.9869 0.0214 95.2774)",
        "--accent-foreground": "oklch(0.4732 0.1247 46.2007)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.9276 0.0058 264.5313)",
        "--input": "oklch(0.9276 0.0058 264.5313)",
        "--ring": "oklch(0.7686 0.1647 70.0804)",
      },
      dark: {
        "--background": "oklch(0.2046 0 0)",
        "--foreground": "oklch(0.9219 0 0)",
        "--card": "oklch(0.2686 0 0)",
        "--card-foreground": "oklch(0.9219 0 0)",
        "--popover": "oklch(0.2686 0 0)",
        "--popover-foreground": "oklch(0.9219 0 0)",
        "--primary": "oklch(0.7686 0.1647 70.0804)",
        "--primary-foreground": "oklch(0 0 0)",
        "--secondary": "oklch(0.2686 0 0)",
        "--secondary-foreground": "oklch(0.9219 0 0)",
        "--muted": "oklch(0.2686 0 0)",
        "--muted-foreground": "oklch(0.7155 0 0)",
        "--accent": "oklch(0.4732 0.1247 46.2007)",
        "--accent-foreground": "oklch(0.9243 0.1151 95.7459)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3715 0 0)",
        "--input": "oklch(0.3715 0 0)",
        "--ring": "oklch(0.7686 0.1647 70.0804)",
      },
    },
  },
  {
    name: "System",
    id: "system",
    preview: "/placeholder.svg?height=120&width=120&text=System+Theme",
    variables: {
      light: {
        "--background": "oklch(1.0000 0 0)",
        "--foreground": "oklch(0.3211 0 0)",
        "--card": "oklch(1.0000 0 0)",
        "--card-foreground": "oklch(0.3211 0 0)",
        "--popover": "oklch(1.0000 0 0)",
        "--popover-foreground": "oklch(0.3211 0 0)",
        "--primary": "oklch(0.6231 0.1880 259.8145)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.9670 0.0029 264.5419)",
        "--secondary-foreground": "oklch(0.4461 0.0263 256.8018)",
        "--muted": "oklch(0.9846 0.0017 247.8389)",
        "--muted-foreground": "oklch(0.5510 0.0234 264.3637)",
        "--accent": "oklch(0.9514 0.0250 236.8242)",
        "--accent-foreground": "oklch(0.3791 0.1378 265.5222)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.9276 0.0058 264.5313)",
        "--input": "oklch(0.9276 0.0058 264.5313)",
        "--ring": "oklch(0.6231 0.1880 259.8145)",
      },
      dark: {
        "--background": "oklch(0.2046 0 0)",
        "--foreground": "oklch(0.9219 0 0)",
        "--card": "oklch(0.2686 0 0)",
        "--card-foreground": "oklch(0.9219 0 0)",
        "--popover": "oklch(0.2686 0 0)",
        "--popover-foreground": "oklch(0.9219 0 0)",
        "--primary": "oklch(0.6231 0.1880 259.8145)",
        "--primary-foreground": "oklch(1.0000 0 0)",
        "--secondary": "oklch(0.2686 0 0)",
        "--secondary-foreground": "oklch(0.9219 0 0)",
        "--muted": "oklch(0.2686 0 0)",
        "--muted-foreground": "oklch(0.7155 0 0)",
        "--accent": "oklch(0.3791 0.1378 265.5222)",
        "--accent-foreground": "oklch(0.8823 0.0571 254.1284)",
        "--destructive": "oklch(0.6368 0.2078 25.3313)",
        "--destructive-foreground": "oklch(1.0000 0 0)",
        "--border": "oklch(0.3715 0 0)",
        "--input": "oklch(0.3715 0 0)",
        "--ring": "oklch(0.6231 0.1880 259.8145)",
      },
    },
  },
]

interface ThemeSelectorFullPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemeSelector({ isOpen, onClose }: ThemeSelectorFullPageProps) {
  const [selectedTheme, setSelectedTheme] = useState("claude")
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("selected-theme")
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(darkMode)
    if (stored) {
      setSelectedTheme(stored)
      applyTheme(stored, darkMode)
    }
  }, [])

  const applyTheme = (themeId: string, dark: boolean) => {
    const theme = themes.find((t) => t.id === themeId)
    if (!theme) return

    const root = document.documentElement
    const variables = dark ? theme.variables.dark : theme.variables.light

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    localStorage.setItem("selected-theme", themeId)

    if (themeId === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      applyTheme("claude", systemDark)
    } else {
      applyTheme(themeId, isDarkMode)
    }

    setTimeout(() => onClose(), 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="absolute inset-0 opacity-0 animate-in fade-in duration-300" style={{ opacity: 1 }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-4xl">
            <h1 className="text-3xl font-light text-white text-center mb-16">Select Theme</h1>

            <div className="flex justify-center gap-12">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={cn(
                    "group flex flex-col items-center gap-6 p-8 rounded-2xl transition-all duration-300 hover:scale-105",
                    selectedTheme === theme.id ? "bg-white/10 ring-2 ring-blue-500" : "hover:bg-white/5",
                  )}
                >
                  <div className="relative">
                    <img
                      src={theme.preview || "/placeholder.svg"}
                      alt={`${theme.name} theme preview`}
                      className="w-32 h-32 rounded-xl object-cover border border-white/20"
                    />
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-black/90" />
                    )}
                  </div>
                  <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
