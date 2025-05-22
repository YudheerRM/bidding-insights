import { pgTable, serial, varchar, text, date, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const office_of_the_prime_minister_procurement = pgTable('office_of_the_prime_minister_procurement', {
  id: uuid('id').primaryKey().defaultRandom().unique(),
  title: text('title').notNull(),
  bid_document: text('bid_document'),
  bid_document_s3_key: text('bid_document_s3_key'),
  status: varchar('status', { length: 50 }).notNull(),
  opening_date: date('opening_date'),
  closing_date: timestamp('closing_date'),
  bid_report: text('bid_report'),
  bid_report_s3_key: text('bid_report_s3_key'),
  amendments: text('amendments'),
  ref_number: text('ref_number'),
  bid_document_cdn_url: text('bid_document_cdn_url'),
  bid_report_cdn_url: text('bid_report_cdn_url'),
  // Additional useful fields
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for type safety
export type ProcurementInsert = typeof office_of_the_prime_minister_procurement.$inferInsert;
export type ProcurementSelect = typeof office_of_the_prime_minister_procurement.$inferSelect;
