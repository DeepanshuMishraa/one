import { Hono } from "hono";
import { cors } from 'hono/cors';
import { auth } from './lib/auth';


const app = new Hono()
const port = process.env.PORT || 8787;

app.use(
  "/api/auth/*",
  cors({
    origin: process.env.FRONTEND_URL as string,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});


app.get("/", (c) => c.text("Hello World"))

if (import.meta.main) {
  console.log(`Server is running on port 8787`);
  Bun.serve({
    port,
    fetch: app.fetch,
  });
}

