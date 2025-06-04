CREATE TABLE "tender_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tender_id" uuid NOT NULL,
	"application_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"application_documents" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tender_applications" ADD CONSTRAINT "tender_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_applications" ADD CONSTRAINT "tender_applications_tender_id_office_of_the_prime_minister_procurement_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."office_of_the_prime_minister_procurement"("id") ON DELETE cascade ON UPDATE no action;