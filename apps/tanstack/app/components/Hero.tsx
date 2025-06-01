import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Mockup } from "./ui/mockup";
import { StarsBackground } from "./ui/stars";
import { Link } from "@tanstack/react-router";
export default function Hero() {

  return (
    <>
      <StarsBackground className="flex flex-col min-h-[100vh]">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center space-y-4 px-4 py-10 mt-16 sm:mt-20 sm:space-y-5 sm:px-6 sm:py-16 md:space-y-6">

          <div className="absolute inset-0 z-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 via-purple-500/20 to-transparent blur-3xl opacity-30 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 via-cyan-400/20 to-transparent blur-3xl opacity-30 animate-pulse [animation-delay:1s]" />
          </div>
          <h1 className="mt-4 text-center text-3xl font-bold sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Talk to your calendar
          </h1>

          <p className="mx-auto max-w-xl text-center text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl">
            Add events, move meetings, and get summaries — all with a simple
            message.
            <span className="hidden sm:inline"><br /> No more clicking around.</span>
          </p>
          <Link to="/login" className="z-10">
            <Button variant="outline" size="lg" className="font-bold mt-4 cursor-pointer">

              Check Your Calendar <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="w-full py-4 sm:py-6 lg:py-8">
            <Mockup
              src="/Hero2.png"
              alt="One-Hero"
              width={1203}
              height={753}
              className="mt-2 sm:mt-4"
            />
          </div>
        </div>
        <div className="w-full mt-auto border-t border-gray-800 relative z-10">
          <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-4 lg:mb-0">© 2025 One. All rights reserved.</div>
            <div className="flex space-x-6">
              <a href="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>
        </div>
      </StarsBackground>
    </>
  );
}
