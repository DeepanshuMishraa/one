import { createAPIFileRoute } from '@tanstack/react-start/api'
import { z } from "zod";
import { db } from '@/db';
import { waitlist } from '@/db/schema';
import { eq } from 'drizzle-orm';

const emailSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const APIRoute = createAPIFileRoute('/api/waitlist')({
  GET: async () => {
    try {
      const waitlistCount = await db.select().from(waitlist).execute();
      return new Response(
        JSON.stringify({
          success: true,
          count: waitlistCount.length
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error("Error fetching waitlist count", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error"
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const result = emailSchema.safeParse(body);

      if (!result.success) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email format" }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      const { email } = result.data;

      const existingUser = await db.select()
        .from(waitlist)
        .where(eq(waitlist.email, email))
        .execute();

      if (existingUser.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Email already on waitlist" }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      const waitlistCount = await db.select().from(waitlist).execute();
      const count = waitlistCount.length + 1;

      await db.insert(waitlist).values({
        id: crypto.randomUUID(),
        email,
        count,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return new Response(
        JSON.stringify({
          success: true,
          count: count
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error("Error adding email to waitlist", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error"
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  }
});
