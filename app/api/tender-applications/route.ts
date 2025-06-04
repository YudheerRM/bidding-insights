import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/database/drizzle';
import { tender_applications, office_of_the_prime_minister_procurement, users } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/tender-applications - Get user's tender applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Get applications with tender details
    const applicationsData = await db
      .select({
        id: tender_applications.id,
        application_status: tender_applications.application_status,
        application_date: tender_applications.application_date,
        notes: tender_applications.notes,
        created_at: tender_applications.created_at,
        updated_at: tender_applications.updated_at,
        // Tender details
        tender_id: office_of_the_prime_minister_procurement.id,
        title: office_of_the_prime_minister_procurement.title,
        ref_number: office_of_the_prime_minister_procurement.ref_number,
        status: office_of_the_prime_minister_procurement.status,
        opening_date: office_of_the_prime_minister_procurement.opening_date,
        closing_date: office_of_the_prime_minister_procurement.closing_date,
      })
      .from(tender_applications)
      .innerJoin(
        office_of_the_prime_minister_procurement,
        eq(tender_applications.tender_id, office_of_the_prime_minister_procurement.id)
      )
      .where(eq(tender_applications.user_id, session.user.id))
      .orderBy(desc(tender_applications.created_at));

    // Transform the flat data into nested structure
    const applications = applicationsData.map(app => ({
      id: app.id,
      tender_id: app.tender_id,
      application_status: app.application_status,
      application_date: app.application_date,
      notes: app.notes,
      tender: {
        id: app.tender_id,
        title: app.title,
        ref_number: app.ref_number,
        status: app.status,
        opening_date: app.opening_date,
        closing_date: app.closing_date,
      }
    }));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching tender applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tender-applications - Create a new tender application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tender_id, notes } = body;

    if (!tender_id) {
      return NextResponse.json({ error: 'Tender ID is required' }, { status: 400 });
    }

    // Check if user already applied to this tender
    const existingApplication = await db
      .select()
      .from(tender_applications)
      .where(
        and(
          eq(tender_applications.user_id, session.user.id),
          eq(tender_applications.tender_id, tender_id)
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied to this tender' },
        { status: 409 }
      );
    }

    // Check if tender exists and is still open
    const tender = await db
      .select()
      .from(office_of_the_prime_minister_procurement)
      .where(eq(office_of_the_prime_minister_procurement.id, tender_id))
      .limit(1);

    if (tender.length === 0) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }

    if (tender[0].status.toLowerCase() !== 'open') {
      return NextResponse.json(
        { error: 'This tender is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Create the application
    const newApplication = await db
      .insert(tender_applications)
      .values({
        user_id: session.user.id,
        tender_id,
        application_status: 'submitted',
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tender application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tender-applications - Remove a tender application
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Check if application exists and belongs to user
    const existingApplication = await db
      .select()
      .from(tender_applications)
      .where(
        and(
          eq(tender_applications.id, applicationId),
          eq(tender_applications.user_id, session.user.id)
        )
      )
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only allow deletion if application is still pending
    if (existingApplication[0].application_status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete application that has already been submitted' },
        { status: 400 }
      );
    }

    // Delete the application
    await db
      .delete(tender_applications)
      .where(
        and(
          eq(tender_applications.id, applicationId),
          eq(tender_applications.user_id, session.user.id)
        )
      );

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
