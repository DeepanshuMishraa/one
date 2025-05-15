import { cn } from "@/lib/utils";
import { DotPattern } from "./magicui/dot-pattern";
import { RainbowButton } from "./magicui/rainbow-button";
import { Safari } from "./magicui/safari";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <>
      <DotPattern
        className={cn(
          "fixed inset-0 -z-10",
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />
      <div className="motion-blur-in-md motion-opacity-in-0 flex flex-col items-center justify-center mt-8 sm:mt-12 md:mt-20 px-2 sm:px-4 space-y-6 sm:space-y-8 md:space-y-12">
        <div className="flex flex-col items-center space-y-2">
          <RainbowButton className="rounded-full text-xs sm:text-sm">
            Early access
          </RainbowButton>
        </div>

        <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 max-w-[95%] sm:max-w-xl md:max-w-2xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide">
            Talk to your calendar
          </h1>
          <p className="text-sm sm:text-base md:text-lg tracking-normal text-zinc-400 px-2">
            Add events, move meetings, and get summaries — all with a simple message.
            <span className="hidden sm:inline"> No more clicking around.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <RainbowButton className="rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 w-full sm:w-auto text-sm sm:text-base">
            Join waitlist →
          </RainbowButton>
          <Button variant="ghost" className="text-zinc-400 w-full sm:w-auto text-sm sm:text-base">
            Coming Soon
          </Button>
        </div>

        <div className="w-full px-0 sm:px-8 md:px-12 lg:px-16">
          <div className="w-[98%] sm:max-w-[1400px] mx-auto">
            <Safari
              mode="simple"
              url="one.deepanshumishra.xyz"
              imageSrc="/mocky.png"
              width={1203}
              height={753}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </>
  )
}
