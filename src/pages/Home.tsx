import Hero from "@/components/Hero";
import Appbar from "@/components/Appbar";
import { useSession } from "@/lib/auth.client";
import { useNavigate } from "react-router";

export default function Home() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  if (session?.user) {
    navigate("/dashboard");
  }

  return (
    <>
      <Appbar />
      <Hero />
    </>
  );
}
