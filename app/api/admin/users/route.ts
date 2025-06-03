import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { eq, ilike, or, desc, asc, and, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - Get all users with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;    // Build query conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.companyName, `%${search}%`)
        )
      );
    }
    
    if (userType) {
      whereConditions.push(eq(users.userType, userType as any));
    }
    
    if (isActive !== null && isActive !== '') {
      whereConditions.push(eq(users.isActive, isActive === 'true'));
    }

    // Combine conditions
    const whereClause = whereConditions.length > 0 
      ? whereConditions.length === 1 
        ? whereConditions[0] 
        : and(...whereConditions)
      : undefined;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;    // Get paginated users with proper query building
    const baseQuery = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        userType: users.userType,
        isActive: users.isActive,
        subscriptionTier: users.subscriptionTier,
        companyName: users.companyName,
        phoneNumber: users.phoneNumber,
        department: users.department,
        position: users.position,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    // Build the complete query with all conditions
    let orderByClause;
    if (sortBy === 'createdAt') {
      orderByClause = sortOrder === 'asc' ? asc(users.createdAt) : desc(users.createdAt);
    } else if (sortBy === 'name') {
      orderByClause = sortOrder === 'asc' ? asc(users.name) : desc(users.name);
    } else if (sortBy === 'email') {
      orderByClause = sortOrder === 'asc' ? asc(users.email) : desc(users.email);
    } else {
      orderByClause = desc(users.createdAt);
    }

    const usersData = await baseQuery
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      users: usersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      email,
      name,
      password,
      userType,
      isActive = true,
      subscriptionTier,
      companyName,
      phoneNumber,
      address,
      department,
      position,
      governmentId,
      businessRegistrationNumber,
      taxId,
      bidderCategory,
      certifications
    } = body;

    // Validate required fields
    if (!email || !name || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, name, password, and user type are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        userType,
        isActive,
        subscriptionTier,
        companyName,
        phoneNumber,
        address,
        department,
        position,
        governmentId,
        businessRegistrationNumber,
        taxId,
        bidderCategory,
        certifications: certifications ? JSON.stringify(certifications) : null,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        userType: users.userType,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      { message: 'User created successfully', user: newUser[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      email,
      name,
      password,
      userType,
      isActive,
      subscriptionTier,
      companyName,
      phoneNumber,
      address,
      department,
      position,
      governmentId,
      businessRegistrationNumber,
      taxId,
      bidderCategory,
      certifications
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (userType !== undefined) updateData.userType = userType;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    if (governmentId !== undefined) updateData.governmentId = governmentId;
    if (businessRegistrationNumber !== undefined) updateData.businessRegistrationNumber = businessRegistrationNumber;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (bidderCategory !== undefined) updateData.bidderCategory = bidderCategory;
    if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications);

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        userType: users.userType,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser[0],
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db
      .select({ id: users.id, userType: users.userType })
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin users (safety measure)
    if (existingUser[0].userType === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: String(error) },
      { status: 500 }
    );
  }
}
