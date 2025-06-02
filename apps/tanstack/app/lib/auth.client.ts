import { createAuthClient } from "better-auth/react"
export const { useSession, signIn, signOut } = createAuthClient({
  baseURL: "http://localhost:8787",
})
