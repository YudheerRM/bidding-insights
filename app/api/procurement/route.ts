import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/drizzle';
import { office_of_the_prime_minister_procurement } from '@/database/schema';

// GET /api/procurement - Retrieve all procurement records
export async function GET(req: NextRequest) {
  try {
    const records = await db.select().from(office_of_the_prime_minister_procurement);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch procurement records', details: String(error) }, { status: 500 });
  }
}
