CREATE TABLE "calendar_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"time_zone" text NOT NULL,
	"calendar_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"location" text,
	"attendees" text DEFAULT '[]' NOT NULL,
	"status" text NOT NULL,
	"event_created_at" timestamp NOT NULL,
	"event_updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_metadata" ADD CONSTRAINT "calendar_metadata_calendar_id_user_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;