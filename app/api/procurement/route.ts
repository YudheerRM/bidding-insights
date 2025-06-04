import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/drizzle';
import { office_of_the_prime_minister_procurement } from '@/database/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/procurement - Retrieve all procurement records
export async function GET(req: NextRequest) {
  try {
    const records = await db.select().from(office_of_the_prime_minister_procurement);
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch procurement records', details: String(error) }, { status: 500 });
  }
}

// POST /api/procurement - Create a new procurement record
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions (only admin and government officials can create tenders)
    if (!['admin', 'government_official'].includes(session.user.userType)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.ref_number || !body.status) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, ref_number, and status are required' 
      }, { status: 400 });
    }

    // Insert the new procurement record
    const [newRecord] = await db.insert(office_of_the_prime_minister_procurement).values({
      title: body.title,
      ref_number: body.ref_number,
      status: body.status,
      opening_date: body.opening_date || null,
      closing_date: body.closing_date ? new Date(body.closing_date) : null,
      bid_document: body.bid_document || null,
      bid_document_s3_key: body.bid_document_s3_key || null,
      bid_document_cdn_url: body.bid_document_cdn_url || null,
      bid_report: body.bid_report || null,
      bid_report_s3_key: body.bid_report_s3_key || null,
      bid_report_cdn_url: body.bid_report_cdn_url || null,
      amendments: body.amendments || null,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating procurement record:', error);
    return NextResponse.json({ 
      error: 'Failed to create procurement record', 
      details: String(error) 
    }, { status: 500 });
  }
}
