import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get total users count
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active users count
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`is_active = true`);
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get inactive users count
    const inactiveUsers = totalUsers - activeUsers;

    // Get new signups in last 30 days
    const newSignupsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= NOW() - INTERVAL '30 days'`);
    const newSignups = newSignupsResult[0]?.count || 0;

    // Get user type distribution
    const userTypesResult = await db
      .select({
        type: users.userType,
        count: sql<number>`count(*)`
      })
      .from(users)
      .groupBy(users.userType);

    const userTypes = userTypesResult.map(row => ({
      type: row.type,
      count: Number(row.count)
    }));

    return NextResponse.json({
      totalUsers: Number(totalUsers),
      activeUsers: Number(activeUsers),
      inactiveUsers: Number(inactiveUsers),
      newSignups: Number(newSignups),
      userTypes
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics', details: String(error) },
      { status: 500 }
    );
  }
}
