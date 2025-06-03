import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { profileUpdateSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = profileUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    const updateData = validatedData.data;

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No data to update" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    cleanUpdateData.updatedAt = new Date();

    const updatedUser = await db
      .update(users)
      .set(cleanUpdateData)
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        userType: users.userType,
        companyName: users.companyName,
        phoneNumber: users.phoneNumber,
        address: users.address,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
