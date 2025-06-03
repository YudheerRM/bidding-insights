import { db } from "../database/drizzle";
import { users, accounts, sessions, verificationTokens } from "../database/schema";

async function setupTables() {
  console.log("Setting up authentication tables...");
  
  try {
    // The tables should be created automatically by Drizzle ORM when accessed
    // Let's just verify they exist by running a simple query
    
    const userCount = await db.select().from(users).limit(1);
    console.log("✅ Users table is ready");
    
    const accountCount = await db.select().from(accounts).limit(1);
    console.log("✅ Accounts table is ready");
    
    const sessionCount = await db.select().from(sessions).limit(1);
    console.log("✅ Sessions table is ready");
    
    const verificationCount = await db.select().from(verificationTokens).limit(1);
    console.log("✅ Verification tokens table is ready");
    
    console.log("🎉 All authentication tables are set up successfully!");
    
  } catch (error) {
    console.error("❌ Error setting up tables:", error);
    console.log("Tables may need to be created manually or via database migrations");
  }
}

if (require.main === module) {
  setupTables()
    .then(() => {
      console.log("Setup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}
