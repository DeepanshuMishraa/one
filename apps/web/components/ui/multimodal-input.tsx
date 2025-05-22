"use client";

import { motion } from "motion/react";
import { Calendar, Clock, CalendarRange } from "lucide-react";
import AI_Prompt from "@/components/ai-prompt";

const QuickActions = [
    {
        action: "Schedule a meeting",
        icon: Calendar,
        gradient: "from-zinc-900/50 to-black/50",
        hoverGradient: "hover:from-zinc-800/50 hover:to-zinc-900/50",
    },
    {
        action: "Find free time slots",
        icon: Clock,
        gradient: "from-zinc-900/50 to-black/50",
        hoverGradient: "hover:from-zinc-800/50 hover:to-zinc-900/50",
    },
    {
        action: "Manage availability",
        icon: CalendarRange,
        gradient: "from-zinc-900/50 to-black/50",
        hoverGradient: "hover:from-zinc-800/50 hover:to-zinc-900/50",
    },
];

export function MultimodalInput() {
    return (
        <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
                <AI_Prompt />
            </div>
            <div className="grid sm:grid-cols-3 gap-2 w-full">
                {QuickActions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{
                                delay: 0.1 * index,
                                duration: 0.4,
                                ease: "easeOut",
                            }}
                            key={index}
                            className={`${index > 1 ? "hidden sm:block" : "block"
                                } h-full`}
                        >
                            <button
                                type="button"
                                className="group w-full h-full text-left rounded-lg p-2.5
                                    bg-zinc-900 hover:bg-zinc-800
                                    border border-zinc-800 hover:border-zinc-700
                                    transition-colors duration-300
                                    flex flex-col justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700">
                                        <Icon
                                            size={14}
                                            className="text-zinc-100"
                                        />
                                    </div>
                                    <div className="text-xs text-zinc-100 font-medium">
                                        {item.action}
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
