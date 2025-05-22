CREATE TABLE "office_of_the_prime_minister_procurement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"bid_document" text,
	"bid_document_s3_key" text,
	"status" varchar(50) NOT NULL,
	"opening_date" date,
	"closing_date" timestamp,
	"bid_report" text,
	"bid_report_s3_key" text,
	"amendments" text,
	"ref_number" text,
	"bid_document_cdn_url" text,
	"bid_report_cdn_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "office_of_the_prime_minister_procurement_id_unique" UNIQUE("id")
);
