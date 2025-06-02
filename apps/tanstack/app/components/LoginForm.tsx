'use client'

import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { signIn } from "../lib/auth.client";
import { Link } from "@tanstack/react-router";


export default function LoginForm() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[100svh] space-y-10">
        <h1 className="text-4xl max-lg:text-2xl tracking-wide font-semibold">Welcome Back , Login to One</h1>
        <Button onClick={() => {
          signIn.social({
            provider: "google",
          })
        }} variant="outline" className="cursor-pointer py-6" size="lg">
          <IconBrandGoogle stroke={3.5} /> Continue with Google
        </Button>

        <div className="flex flex-col items-center justify-center">
          <Link to="/" className="text-md text-muted-foreground text-center">
            Return to Home
          </Link>
        </div>
      </div>


    </>
  )
}
