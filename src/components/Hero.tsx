'use client'
import { RainbowButton } from "./ui/rainbow-button";
import { Mockup } from "./ui/mockup";
import { StarsBackground } from "./ui/stars";
import { Input } from "./ui/input";
import { Counter } from "./Counter";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToastManager } from "./ui/toast";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastManager();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("/api/waitlist");
        setCount(res.data.count);
      } catch (error) {
        console.error("Error fetching waitlist count", error);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const res = await axios.post("/api/waitlist", { email });
      if (res.data.success) {
        toast.add({
          title: "Email added to waitlist",
          description: "You will be notified when we launch",
          type: "success"
        });
        setEmail("");
        setCount(res.data.count);
      }
    } catch (error: any) {
      console.error("Error adding email to waitlist", error);
      if (error.response?.status === 400) {
        toast.add({
          title: "Email already on waitlist",
          type: "warning",
          description: "This email has already been registered for early access"
        });
      } else {
        toast.add({
          title: "Error adding email",
          description: "Something went wrong. Please try again.",
          
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <StarsBackground className="min-h-[100vh] lg:aspect-16/9 flex items-center justify-center">
        {/* Mobile and tablet layout (up to lg breakpoint) */}
        <div className="flex flex-col items-center justify-center lg:hidden space-y-4 sm:space-y-5 md:space-y-6 px-4 sm:px-6 py-10 sm:py-16 w-full max-w-7xl mx-auto">
          <RainbowButton size="lg" className="rounded-full text-xs sm:text-sm">Early Access</RainbowButton>

          <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-center mt-4 sm:mt-6">
            Talk to your calendar
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 text-center max-w-xl mx-auto">
            Add events, move meetings, and get summaries — all with a simple message.
            <span className="hidden sm:inline"><br /> No more clicking around.</span>
          </p>

          <div className="relative w-full max-w-[85%] sm:max-w-md mt-2 sm:mt-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="What's your email?"
              className="pr-10"
            />
            <button
              onClick={() => handleSubmit()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2 sm:mt-4">
            <Counter start={count} end={count} duration={2} fontSize={14} className="bg-orange-500 text-white font-bold rounded-none sm:text-base md:text-lg" />
            <p className="text-sm sm:text-base md:text-lg font-mono">users have already signed up</p>
          </div>

          <div className="py-4 sm:py-6 w-full">
            <Mockup
              src="/Hero.png"
              alt="One-Hero"
              width={1203}
              height={753}
              className="mt-2 sm:mt-4"
            />
          </div>
        </div>

        {/* Original desktop layout (lg breakpoint and above) */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6 mt-110">
          <RainbowButton size="lg" className="rounded-full">Early Access</RainbowButton>

          <h1 className="font-bold text-6xl">
            Talk to your calendar
          </h1>

          <p className="text-xl text-gray-300 text-center">
            Add events, move meetings, and get summaries — all with a simple message.<br />
            No more clicking around.
          </p>

          <div className="relative w-full max-w-md">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="What's your email?"
              className="pr-10"
            />
            <button
              onClick={() => handleSubmit()}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Counter start={count} end={count} duration={2} fontSize={16} className="bg-orange-500 text-white font-bold rounded-none" />
            <p className="text-xl font-mono">users have already signed up</p>
          </div>

          <div className="py-8 w-full">
            <Mockup
              src="/Hero.png"
              alt="One-Hero"
              width={1203}
              height={753}
            />
          </div>
        </div>
      </StarsBackground>
    </>
  )
}
