"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <motion.div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer",
        isDark
          ? "bg-zinc-950 border border-zinc-800"
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="button"
      tabIndex={0}
      animate={{
        backgroundColor: isDark ? "rgb(9, 9, 11)" : "rgb(255, 255, 255)",
      }}
      transition={{ type: "spring", duration: 0.7 }}
    >
      <div className="flex justify-between items-center w-full relative">
        <motion.div
          className="absolute flex justify-center items-center w-6 h-6 rounded-full"
          animate={{
            x: isDark ? 0 : 32,
            backgroundColor: isDark ? "rgb(39, 39, 42)" : "rgb(229, 231, 235)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
            ) : (
              <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
