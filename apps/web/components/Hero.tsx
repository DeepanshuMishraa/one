"use client";
import { Mockup } from "./ui/mockup";
import { StarsBackground } from "./ui/stars";
import { Input } from "./ui/input";
import { Counter } from "./Counter";
import { useState } from "react";
import { useToastManager } from "./ui/toast";
import { ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function Hero() {
  const [email, setEmail] = useState("");
  const toast = useToastManager();
  const queryClient = useQueryClient();

  const { data: waitlistData } = useQuery({
    queryKey: ["waitlist"],
    queryFn: async () => {
      const res = await axios.get("/api/waitlist");
      return res.data;
    },
  });

  const { mutate: addToWaitlist, isPending: isLoading } = useMutation({
    mutationFn: async (email: string) => {
      const res = await axios.post("/api/waitlist", { email });
      return res.data;
    },
    onSuccess: (data) => {
      toast.add({
        title: "Email added to waitlist",
        description: "You will be notified when we launch",
      });
      setEmail("");
      queryClient.setQueryData(["waitlist"], data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
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
    addToWaitlist(email);
  };

  return (
    <>
      <StarsBackground className="flex flex-col min-h-[100vh]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center space-y-4 px-4 py-10 mt-16 sm:mt-20 sm:space-y-5 sm:px-6 sm:py-16 md:space-y-6">
          <h1 className="mt-4 text-center text-3xl font-bold sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Talk to your calendar
          </h1>

          <p className="mx-auto max-w-xl text-center text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl">
            Add events, move meetings, and get summaries — all with a simple
            message.
            <span className="hidden sm:inline"><br /> No more clicking around.</span>
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
              className="rounded-none bg-orange-500 font-bold text-white sm:text-base md:text-lg lg:text-xl"
            />
            <p className="font-mono text-sm sm:text-base md:text-lg lg:text-xl">
              users have already signed up
            </p>
          </div>

          <div className="w-full py-4 sm:py-6 lg:py-8">
            <Mockup
              src="/Hero.png"
              alt="One-Hero"
              width={1203}
              height={753}
              className="mt-2 sm:mt-4"
            />
          </div>
        </div>

        {/* Footer Section */}
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
