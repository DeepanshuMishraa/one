import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { addWaitlistSchema } from "@repo/types";

export const waitlistRouter = createTRPCRouter({
  waitlist: baseProcedure.query(async () => {
    try {
      const waitlistCount = await db.select().from(waitlist).execute();
      return {
        success: true,
        count: waitlistCount.length,
      } as const;
    } catch (error) {
      throw new Error(`Failed to fetch waitlist count: ${error}`);
    }
  }),

  addToWaitlist: baseProcedure
    .input(addWaitlistSchema)
    .mutation(async ({ input }) => {
      const { email } = input;
      const existingWaitlist = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, email));

      if (existingWaitlist.length > 0) {
        return {
          success: false,
          message: "Email already on waitlist",
        };
      }

      const waitlistCount = await db.select().from(waitlist).execute();
      const newCount = waitlistCount.length + 1;

      await db.insert(waitlist).values({
        id: crypto.randomUUID(),
        email: email,
        count: newCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Email added to waitlist",
      };
    }),
}); 
