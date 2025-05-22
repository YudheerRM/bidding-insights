import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from './schema'; // Import the schema

// Import dotenv only in non-production environments if needed
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.local' });
}
  
// Verify the connection string exists
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}
  
// Create the database connection
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema }); // Pass the schema here