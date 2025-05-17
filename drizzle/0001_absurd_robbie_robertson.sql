CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
