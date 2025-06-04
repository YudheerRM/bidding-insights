import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

// Database configuration
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const client = neon(connectionString);
const db = drizzle(client);

async function createTenderApplicationsTable() {
  console.log('Creating tender_applications table...');
  
  try {
    // Create the tender_applications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tender_applications" (
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
    `);

    console.log('✅ tender_applications table created successfully!');

    // Add foreign key constraints
    try {
      await db.execute(sql`
        ALTER TABLE "tender_applications" 
        ADD CONSTRAINT IF NOT EXISTS "tender_applications_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
      `);
      console.log('✅ User foreign key constraint added!');
    } catch (error) {
      console.log('ℹ️ User foreign key constraint may already exist');
    }

    try {
      await db.execute(sql`
        ALTER TABLE "tender_applications" 
        ADD CONSTRAINT IF NOT EXISTS "tender_applications_tender_id_office_of_the_prime_minister_procurement_id_fk" 
        FOREIGN KEY ("tender_id") REFERENCES "public"."office_of_the_prime_minister_procurement"("id") ON DELETE cascade ON UPDATE no action;
      `);
      console.log('✅ Tender foreign key constraint added!');
    } catch (error) {
      console.log('ℹ️ Tender foreign key constraint may already exist');
    }

    // Create indexes for better performance
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tender_applications_user_id ON tender_applications(user_id);
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tender_applications_tender_id ON tender_applications(tender_id);
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_tender_applications_status ON tender_applications(application_status);
      `);
      console.log('✅ Indexes created successfully!');
    } catch (error) {
      console.log('ℹ️ Indexes may already exist');
    }

    // Add unique constraint for user-tender combination
    try {
      await db.execute(sql`
        ALTER TABLE "tender_applications" 
        ADD CONSTRAINT IF NOT EXISTS unique_user_tender_application 
        UNIQUE(user_id, tender_id);
      `);
      console.log('✅ Unique constraint added successfully!');
    } catch (error) {
      console.log('ℹ️ Unique constraint may already exist');
    }

  } catch (error) {
    console.error('❌ Error creating tender_applications table:', error);
    throw error;
  }
}

async function main() {
  try {
    await createTenderApplicationsTable();
    console.log('🎉 Migration completed successfully!');
    console.log('📄 The tender_applications table is now ready for use!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

export { createTenderApplicationsTable };
