'use client'
import Hero from "@/components/Hero";
import Appbar from "@/components/Appbar";
import { useSession } from "@/lib/auth.client";
import { useRouter } from "next/navigation";
export default function Home() {

  const { data: session } = useSession();
  const router = useRouter();


  if (session?.user) {
    router.push('/dashboard')
  }

  return (
    <>
      <Appbar />
      <Hero />
    </>
  );
}
