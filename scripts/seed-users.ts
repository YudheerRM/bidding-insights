import { db } from "../database/drizzle";
import { users } from "../database/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting user seeding...");

  try {
    // Admin user
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    await db.insert(users).values({
      email: "admin@biddinginsights.gov.na",
      password: adminPassword,
      name: "System Administrator",
      userType: "admin",
      department: "IT Department",
      position: "System Administrator",
      isActive: true,
    });

    // Government Official
    const govPassword = await bcrypt.hash("Gov123!", 12);
    await db.insert(users).values({
      email: "procurement@opm.gov.na",
      password: govPassword,
      name: "John Namibia",
      userType: "government_official",
      department: "Office of the Prime Minister",
      position: "Senior Procurement Officer",
      governmentId: "GOV2024001",
      phoneNumber: "+264 61 287 9111",
      address: "Robert Mugabe Avenue, Windhoek",
      isActive: true,
    });

    // Bidder - Basic tier
    const bidderBasicPassword = await bcrypt.hash("Bidder123!", 12);
    await db.insert(users).values({
      email: "info@constructioncompany.com.na",
      password: bidderBasicPassword,
      name: "Maria Construction",
      userType: "bidder",
      companyName: "Namibia Construction Company Ltd",
      businessRegistrationNumber: "CC/2020/12345",
      taxId: "1234567890",
      bidderCategory: "construction",
      subscriptionTier: "basic",
      phoneNumber: "+264 81 123 4567",
      address: "Industrial Street 45, Windhoek",
      isActive: true,
    });

    // Bidder - Premium tier
    const bidderPremiumPassword = await bcrypt.hash("Premium123!", 12);
    const premiumExpiry = new Date();
    premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);
    
    await db.insert(users).values({
      email: "contracts@techsolutions.na",
      password: bidderPremiumPassword,
      name: "David Techman",
      userType: "bidder",
      companyName: "TechSolutions Namibia",
      businessRegistrationNumber: "CC/2019/67890",
      taxId: "0987654321",
      bidderCategory: "it_services",
      subscriptionTier: "premium",
      subscriptionExpiry: premiumExpiry,
      phoneNumber: "+264 85 987 6543",
      address: "Tech Park, Klein Windhoek",
      certifications: "ISO 27001, ITIL v4",
      isActive: true,
    });

    // Viewer
    const viewerPassword = await bcrypt.hash("Viewer123!", 12);
    await db.insert(users).values({
      email: "citizen@example.com",
      password: viewerPassword,
      name: "Public Citizen",
      userType: "viewer",
      phoneNumber: "+264 81 555 0123",
      isActive: true,
    });

    console.log("✅ User seeding completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("1. Admin: admin@biddinginsights.gov.na / Admin123!");
    console.log("2. Gov Official: procurement@opm.gov.na / Gov123!");
    console.log("3. Bidder (Basic): info@constructioncompany.com.na / Bidder123!");
    console.log("4. Bidder (Premium): contracts@techsolutions.na / Premium123!");
    console.log("5. Viewer: citizen@example.com / Viewer123!");
    
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
