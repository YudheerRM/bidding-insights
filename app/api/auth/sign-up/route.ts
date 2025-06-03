import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = signUpSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      name,
      userType,
      companyName,
      phoneNumber,
      address,
      // Government Official fields
      department,
      position,
      governmentId,
      // Bidder fields
      businessRegistrationNumber,
      taxId,
      bidderCategory,
      certifications,
      subscriptionTier,
    } = validatedData.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      userType,
      companyName,
      phoneNumber,
      address,
      isActive: true,
    };

    // Add type-specific fields
    if (userType === "government_official") {
      userData.department = department;
      userData.position = position;
      userData.governmentId = governmentId;
    } else if (userType === "bidder") {
      userData.businessRegistrationNumber = businessRegistrationNumber;
      userData.taxId = taxId;
      userData.bidderCategory = bidderCategory;
      userData.certifications = certifications;
      userData.subscriptionTier = subscriptionTier || "basic";
      
      // Set subscription expiry for paid plans
      if (subscriptionTier && subscriptionTier !== "basic") {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
        userData.subscriptionExpiry = expiryDate;
      }
    } else if (userType === "admin") {
      userData.department = department;
      userData.position = position;
    }

    // Create the user
    const newUser = await db.insert(users).values(userData).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      userType: users.userType,
      subscriptionTier: users.subscriptionTier,
      companyName: users.companyName,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
