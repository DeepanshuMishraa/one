import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router";

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-auto bg-white dark:bg-[#111111]">
      <div className="relative z-10 flex flex-grow flex-col">
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 hover:text-gray-900 dark:text-white dark:hover:text-white/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-16">
          <Card className="overflow-hidden rounded-xl border-none bg-gray-50/80 dark:bg-transparent">
            <CardHeader className="space-y-4 px-8 py-8">
              <div className="space-y-2 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                  About Us
                </CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-8 p-8">
              {sections.map((section) => (
                <div key={section.title} className="p-6">
                  <h2 className="mb-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <div className="prose prose-sm prose-a:text-blue-600 hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 max-w-none text-gray-600 dark:text-white/80">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const sections = [
  {
    title: "Our Mission",
    content: (
      <p>
        One is an AI Powered Calendar Assistant that allows you to chat with
        your calendar. It helps you manage your schedule, find time for
        meetings, and even book appointments. One is designed to be your
        personal assistant, making it easier to stay organized and on top of
        your tasks.
      </p>
    ),
  },
  {
    title: "Why We Started",
    content: (
      <p>
        We started One because we believe managing your calendar shouldn&apos;t
        be a full-time job. In today&apos;s fast-paced world, professionals
        spend countless hours scheduling meetings, finding available time slots,
        and coordinating with multiple parties. We saw an opportunity to
        leverage AI to simplify this process and give people back their most
        valuable resource - time. By creating an AI assistant that can
        understand natural language and directly interact with your calendar,
        we&apos;re making schedule management as simple as having a conversation
        with a helpful friend.
      </p>
    ),
  },
  {
    title: "Open Source",
    content: (
      <div className="space-y-4">
        <p>
          One is built on the principles of transparency and community
          collaboration. Our entire codebase is open source, allowing anyone to:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>Review our code for security and privacy</li>
          <li>Contribute improvements and new features</li>
          <li>Self-host their own instance of One</li>
          <li>Learn from and build upon our work</li>
        </ul>
        <p>
          We believe that calendar is too important to be controlled by a single
          entity. By being open source, we ensure that One remains transparent,
          trustworthy, and accessible to everyone.
        </p>
      </div>
    ),
  },
  {
    title: "Our Founders",
    content: (
      <div className="space-y-4">
        <p>
          Deepanshu the founder of One is a undergrad student , who is
          passionate about building products that help people save time. He is a
          full stack developer who faced problems in managing his own calendar
          and decided to build a solution for himself and others. He is a big
          fan of AI and believes that AI can help people save time and improve
          their productivity.
        </p>
        <p>
          He is driven by a shared belief that calendar should help you move
          faster, not slow you down.
        </p>
      </div>
    ),
  },
  {
    title: "Contact",
    content: (
      <div className="space-y-3">
        <p>Want to learn more about One? Get in touch:</p>
        <div className="flex flex-col space-y-2">
          <a
            href="mailto:d4deepanshu723@gmail.com"
            className="inline-flex items-center text-blue-400 hover:text-blue-300"
          >
            <Mail className="mr-2 h-4 w-4" />
            d4deepanshu723@gmail.com
          </a>
          <a
            href="https://github.com/DeepanshuMishraa/One"
            className="inline-flex items-center text-blue-400 hover:text-blue-300"
          >
            <Github className="mr-2 h-4 w-4" />
            Open an issue on GitHub
          </a>
        </div>
      </div>
    ),
  },
];
