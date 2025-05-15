import Link from "next/link";
import { Button } from "./ui/button";
import { IconBrandGithubFilled } from "@tabler/icons-react"
import { ThemeToggle } from "./ui/toggle";
export default function Appbar() {
  return (
    <div className="flex items-center justify-between m-4">
      <Link prefetch href="/" className="text-2xl font-normal">r
        One
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="https://github.com/DeepanshuMishraa/one" prefetch><Button variant="outline" className="gap-2 flex items-center font-mono cursor-pointer rounded-2xl"><IconBrandGithubFilled />Github</Button></Link>
      </div>
    </div>
  )
}
