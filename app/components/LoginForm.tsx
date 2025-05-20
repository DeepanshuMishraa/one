import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { signIn } from "@/lib/auth.client";
import { Link } from "@tanstack/react-router";

export default function LoginForm() {
  return (
    <>
      <div className="flex min-h-[100svh] flex-col items-center justify-center space-y-10">
        <h1 className="text-4xl font-semibold tracking-wide max-lg:text-2xl">
          Welcome Back , Login to One
        </h1>
        <Button
          onClick={() => {
            signIn.social({
              provider: "google",
            });
          }}
          variant="outline"
          className="cursor-pointer py-6"
          size="lg"
        >
          <IconBrandGoogle stroke={3.5} /> Continue with Google
        </Button>

        <div className="flex flex-col items-center justify-center">
          <Link to="/" className="text-md text-muted-foreground text-center">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}
