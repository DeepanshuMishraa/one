import Appbar from "@/components/Appbar";
import Hero from "@/components/Hero";
import { useSession } from "@/lib/auth.client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";


export const Route = createFileRoute('/')({
  component: Home,
})


function Home() {
  const { data: session } = useSession();
  const navigate = useNavigate()
  if (session?.user) {
    navigate({ to: `/dashboard` })
  }
  return (
    <>
      <Appbar />
      <Hero />
    </>
  )
}
