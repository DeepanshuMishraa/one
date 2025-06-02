import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import { account, session, user, verification } from "@repo/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTERAUTH_URL as string,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      verification,
      account
    }
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.events.readonly"
      ],
      redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
      accessType: "offline",
      prompt: "consent"
    }
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    }
  },
  trustedOrigins: [process.env.FRONTEND_URL as string]
});
