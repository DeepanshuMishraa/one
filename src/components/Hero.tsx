"use client";
import { RainbowButton } from "./ui/rainbow-button";
import { Mockup } from "./ui/mockup";
import { StarsBackground } from "./ui/stars";
import { Input } from "./ui/input";
import { Counter } from "./Counter";
import { useState } from "react";
import { useToastManager } from "./ui/toast";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/trpc/client";

export default function Hero() {
  const [email, setEmail] = useState("");
  const toast = useToastManager();
  const utils = trpc.useContext();

  const { data: waitlistData } = trpc.waitlist.useQuery();

  const { mutate: addToWaitlist, isPending: isLoading } =
    trpc.addToWaitlist.useMutation({
      onSuccess: () => {
        toast.add({
          title: "Email added to waitlist",
          description: "You will be notified when we launch",
        });
        setEmail("");
        utils.waitlist.invalidate();
      },
      onError: (error: any) => {
        if (error.message === "Email already on waitlist") {
          toast.add({
            title: "Email already on waitlist",
            type: "warning",
            description:
              "This email has already been registered for early access",
          });
        } else {
          toast.add({
            title: "Error adding email",
            description: "Something went wrong. Please try again.",
          });
        }
      },
    });

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!email) return;
    addToWaitlist({ email });
  };

  return (
    <>
      <StarsBackground className="flex min-h-[100vh] items-center justify-center lg:aspect-16/9">
        {/* Mobile and tablet layout (up to lg breakpoint) */}
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center space-y-4 px-4 py-10 sm:space-y-5 sm:px-6 sm:py-16 md:space-y-6 lg:hidden">
          <RainbowButton size="lg" className="rounded-full text-xs sm:text-sm">
            Early Access
          </RainbowButton>

          <h1 className="mt-4 text-center text-3xl font-bold sm:mt-6 sm:text-4xl md:text-5xl">
            Talk to your calendar
          </h1>

          <p className="mx-auto max-w-xl text-center text-sm text-gray-300 sm:text-base md:text-lg">
            Add events, move meetings, and get summaries — all with a simple
            message.
            <span className="hidden sm:inline">
              <br /> No more clicking around.
            </span>
          </p>

          <div className="relative mt-2 w-full max-w-[85%] sm:mt-4 sm:max-w-md">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="What's your email?"
              className="pr-10"
            />
            <button
              onClick={() => handleSubmit()}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
              disabled={isLoading}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-2 flex flex-col items-center gap-1 sm:mt-4 sm:flex-row sm:gap-2">
            <Counter
              start={waitlistData?.count ?? 0}
              end={waitlistData?.count ?? 0}
              duration={2}
              fontSize={14}
              className="rounded-none bg-orange-500 font-bold text-white sm:text-base md:text-lg"
            />
            <p className="font-mono text-sm sm:text-base md:text-lg">
              users have already signed up
            </p>
          </div>

          <div className="w-full py-4 sm:py-6">
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
        <div className="mt-110 hidden flex-col items-center justify-center space-y-6 lg:flex">
          <RainbowButton size="lg" className="rounded-full">
            Early Access
          </RainbowButton>

          <h1 className="text-6xl font-bold">Talk to your calendar</h1>

          <p className="text-center text-xl text-gray-300">
            Add events, move meetings, and get summaries — all with a simple
            message.
            <br />
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
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
              disabled={isLoading}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Counter
              start={waitlistData?.count ?? 0}
              end={waitlistData?.count ?? 0}
              duration={2}
              fontSize={16}
              className="rounded-none bg-orange-500 font-bold text-white"
            />
            <p className="font-mono text-xl">users have already signed up</p>
          </div>

          <div className="w-full py-8">
            <Mockup src="/Hero.png" alt="One-Hero" width={1203} height={753} />
          </div>
        </div>
      </StarsBackground>
    </>
  );
}
