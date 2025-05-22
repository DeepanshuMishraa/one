import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
  } catch (error) {
    console.error("Error adding email to waitlist", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
