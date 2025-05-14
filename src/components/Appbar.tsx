import Link from "next/link";
import { Button } from "./ui/button";
import { IconBrandGithub } from "@tabler/icons-react"

export default function Appbar() {
  return (
    <div className="flex items-center justify-between m-4">
      <Link prefetch href="/" className="text-2xl font-normal">
        One
      </Link>

      <Button variant="outline" className="gap-2 flex items-center font-sans"><IconBrandGithub />Github</Button>
    </div>
  )
}
