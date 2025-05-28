import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import arcjet, { protectSignup } from "@arcjet/next";

const aj = arcjet({

  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com

  rules: [

    protectSignup({

      email: {

        mode: "LIVE", // will block requests. Use "DRY_RUN" to log only

        // Block emails that are disposable, invalid, or have no MX records

        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],

      },

      bots: {

        mode: "LIVE",

        // configured with a list of bots to allow from

        // https://arcjet.com/bot-list

        allow: [], // "allow none" will block all detected bots

      },

      // It would be unusual for a form to be submitted more than 5 times in 10

      // minutes from the same IP address

      rateLimit: {

        // uses a sliding window rate limit

        mode: "LIVE",

        interval: "10m", // counts requests over a 10 minute sliding window

        max: 5, // allows 5 submissions within the window

      },

    }),

  ],

});


export async function GET() {
  try {
    const waitlistCount = await db.select().from(waitlist).execute();
    return NextResponse.json({
      success: true,
      count: waitlistCount.length
    });
  } catch (error) {
    console.error("Error fetching waitlist count", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const decision = await aj.protect(req, {
      email: email
    });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        return NextResponse.json(

          {

            message: "Invalid email",

            reason: decision.reason,

          },

          { status: 403 },

        );
      } else {

        return NextResponse.json({ message: "Forbidden" }, { status: 403 });

      }
    } else {
      const existingWaitlist = await db.select().from(waitlist).where(eq(waitlist.email, email));

      if (existingWaitlist.length > 0) {
        return NextResponse.json({
          success: false,
          message: "Email already on waitlist"
        }, { status: 400 })
      }

      const waitlistCount = await db.select().from(waitlist).execute();
      const newCount = waitlistCount.length + 1;

      await db.insert(waitlist).values({
        id: crypto.randomUUID(),
        email: email,
        count: newCount,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json({
        success: true,
        message: "Email added to waitlist",
      }, { status: 200 })
    }
  } catch (error) {
    console.error("Error adding email to waitlist", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
