import { pgTable, serial, varchar, text, date, timestamp, boolean, uuid, decimal, primaryKey, integer } from 'drizzle-orm/pg-core';

// User types enum
export const userTypeEnum = ['government_official', 'bidder', 'admin', 'viewer'] as const;
export type UserType = typeof userTypeEnum[number];

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  password: text('password'), // For credentials login
  userType: varchar('user_type', { length: 50 }).notNull().$type<UserType>(),
  isActive: boolean('is_active').default(true).notNull(),
  // Subscription/Payment related
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  subscriptionExpiry: timestamp('subscription_expiry'),
  // Profile information
  companyName: varchar('company_name', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  // Government Official specific fields
  department: varchar('department', { length: 255 }),
  position: varchar('position', { length: 255 }),
  governmentId: varchar('government_id', { length: 100 }),
  // Bidder specific fields
  businessRegistrationNumber: varchar('business_registration_number', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  bidderCategory: varchar('bidder_category', { length: 100 }),
  certifications: text('certifications'), // JSON string of certifications
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// NextAuth required tables
export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires').notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const office_of_the_prime_minister_procurement = pgTable('office_of_the_prime_minister_procurement', {
  id: uuid('id').primaryKey().defaultRandom(),
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

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;
export type AccountSelect = typeof accounts.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;
