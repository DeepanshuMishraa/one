"use client";

import { StarsBackground } from "./ui/stars";

export default function Footer() {
  return (
    <StarsBackground className="w-full py-10">
      <div className="container mx-auto flex items-center justify-between px-4">
        <p className="text-sm ">
          © {new Date().getFullYear()} One. All rights reserved.
        </p>
        <div className="flex items-center space-x-6">
          <a
            href="/privacy"
            className="text-sm transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </StarsBackground>
  );
}
