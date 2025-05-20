import { Button } from "@/components/ui/button";
import { IconArrowBack } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 bg-gray-800/10">
      <h1 className="text-8xl font-bold">404</h1>
      <p className="text-xl font-medium text-gray-400">Page not found</p>
      <Button variant="outline" className="cursor-pointer rounded-md" asChild>
        <Link preload="intent" to="/">
          <IconArrowBack className="hover:animate-caret-blink" />
          Go Back
        </Link>
      </Button>
    </div>
  );
} 
