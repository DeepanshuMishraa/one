import { RainbowButton } from "./magicui/rainbow-button";
import { Safari } from "./magicui/safari";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="motion-blur-in-md motion-opacity-in-0 flex flex-col items-center justify-center mt-12 md:mt-20 px-4 space-y-8 md:space-y-12">
      <div className="flex flex-col items-center space-y-2">
        <RainbowButton className="rounded-full text-xs sm:text-sm">
          Early access
        </RainbowButton>
      </div>

      <div className="text-center space-y-4 md:space-y-6 max-w-[85%] sm:max-w-xl md:max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Talk to your calendar
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 px-2 sm:px-8">
          Add events, move meetings, and get summaries — all with a simple message.
          <span className="hidden sm:inline"> No more clicking around.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <RainbowButton className="rounded-lg px-5 py-2.5 w-full sm:w-auto">
          Join waitlist →
        </RainbowButton>
        <Button variant="ghost" className="text-zinc-400 w-full sm:w-auto">
          Coming Soon
        </Button>
      </div>
        <Safari height={167} mode="simple" url="calendar.one.gg" />
    </div>
  )
}
