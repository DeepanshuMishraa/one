"use client"

import { RiPaletteLine } from "@remixicon/react"
import { useState } from "react"
import ThemeSelector from "./theme-selector"

export default function ThemeToggle() {
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsThemeSelectorOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        aria-label="Open theme selector"
      >
        <RiPaletteLine size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      <ThemeSelector isOpen={isThemeSelectorOpen} onClose={() => setIsThemeSelectorOpen(false)} />
    </>
  )
}
