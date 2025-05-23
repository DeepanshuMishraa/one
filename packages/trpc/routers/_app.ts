import { createTRPCRouter } from "../init";
import { waitlistRouter } from "./waitlist";
import { calendarRouter } from "./calendar";

export const appRouter = createTRPCRouter({
  waitlist: waitlistRouter,
  calendar: calendarRouter,
});

export type AppRouter = typeof appRouter;
