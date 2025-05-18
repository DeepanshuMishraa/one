import { Button } from "@/components/ui/button";
import { IconArrowBack } from "@tabler/icons-react";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col space-y-6 items-center justify-center bg-gray-800/10">
      <h1 className="font-bold text-8xl">404</h1>
      <p className="text-gray-400 text-xl font-medium">Page not found</p>
      <Button variant="outline" className="rounded-md cursor-pointer" asChild>
        <Link href="/"><IconArrowBack className="hover:animate-caret-blink" />Go Back</Link>
      </Button>
    </div>
  )
}
