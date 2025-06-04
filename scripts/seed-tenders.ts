import { db } from '../database/drizzle';
import { office_of_the_prime_minister_procurement } from '../database/schema';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';

// Sample data for generating realistic tender records
const tenderTitles = [
  "Supply and Installation of Office Equipment",
  "Construction of Government Building Phase 2",
  "IT Infrastructure Upgrade Project",
  "Road Maintenance and Repair Services",
  "Medical Equipment Procurement",
  "Security Services for Government Facilities",
  "Vehicle Fleet Management Services",
  "Cleaning and Maintenance Services",
  "Electrical Installation and Maintenance",
  "Water Supply System Upgrade",
  "Telecommunications Equipment Supply",
  "Furniture and Fixtures Procurement",
  "Software License and Support Services",
  "Building Renovation and Refurbishment",
  "Waste Management Services",
  "Catering Services for Government Events",
  "Printing and Publishing Services",
  "Legal Advisory Services",
  "Financial Audit Services",
  "Training and Development Services",
  "Consultancy Services for Policy Development",
  "Laboratory Equipment and Supplies",
  "Air Conditioning System Installation",
  "Fire Safety Equipment Installation",
  "Landscaping and Gardening Services",
  "Stationery and Office Supplies",
  "Event Management Services",
  "Translation and Interpretation Services",
  "Research and Development Services",
  "Engineering Design Services",
  "Marketing and Communication Services",
  "Health and Safety Equipment Supply",
  "Educational Material Development",
  "Website Development and Maintenance",
  "Database Management Services",
  "Transportation Services",
  "Insurance Services",
  "Banking and Financial Services",
  "Real Estate Services",
  "Equipment Rental Services",
  "Maintenance of Government Vehicles",
  "Public Relations Services",
  "Architectural Design Services",
  "Survey and Mapping Services",
  "Environmental Impact Assessment",
  "Quality Assurance Services",
  "Project Management Services",
  "Human Resource Services",
  "Information Security Services",
  "Data Analytics Services"
];

const statuses = [
  "Open",
  "Closed",
  "Awarded",
  "Cancelled",
  "Under Review",
  "Pending",
  "Draft",
  "Published"
];

const departments = [
  "MOFPS", "MOH", "MOEC", "MOJ", "MOCA", "MSTEM", 
  "MFAFT", "MLSS", "MNS", "MEGJC", "MLHSCD", "MAM"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const dept = getRandomElement(departments);
  return `${dept}/${year}/${randomNum}`;
}

function generateRandomTenderData(index: number) {
  const now = new Date();
  const isOpen = Math.random() > 0.4; // 60% chance of being open
  
  // Generate opening date (can be in the past or future)
  const openingDateTime = generateRandomDate(
    subMonths(now, 6), // 6 months ago
    addMonths(now, 3)  // 3 months from now
  );
  
  // Closing date should be after opening date
  const closingDateTime = isOpen 
    ? generateRandomDate(openingDateTime, addMonths(openingDateTime, 2))
    : generateRandomDate(openingDateTime, addDays(openingDateTime, 60));
  
  const status = isOpen && closingDateTime > now ? "Open" : getRandomElement(statuses);
  
  const hasDocuments = Math.random() > 0.3; // 70% chance of having documents
  const hasReport = status === "Closed" || status === "Awarded" ? Math.random() > 0.5 : false;
  
  // Format opening_date as string in YYYY-MM-DD format (for date type)
  const openingDateStr = openingDateTime.toISOString().split('T')[0];
  
  return {
    title: getRandomElement(tenderTitles),
    bid_document: hasDocuments ? `Bid document for tender ${index + 1}` : null,
    bid_document_s3_key: hasDocuments ? `documents/bid_${index + 1}_${Date.now()}.pdf` : null,
    status: status,
    opening_date: openingDateStr, // date type expects string in YYYY-MM-DD format
    closing_date: closingDateTime, // timestamp type accepts Date object
    bid_report: hasReport ? `Evaluation report for tender ${index + 1}` : null,
    bid_report_s3_key: hasReport ? `reports/report_${index + 1}_${Date.now()}.pdf` : null,
    amendments: Math.random() > 0.7 ? `Amendment ${Math.floor(Math.random() * 3) + 1} - Updated specifications` : null,
    ref_number: generateRefNumber(),
    bid_document_cdn_url: hasDocuments ? `https://cdn.example.com/documents/bid_${index + 1}.pdf` : null,
    bid_report_cdn_url: hasReport ? `https://cdn.example.com/reports/report_${index + 1}.pdf` : null,
  };
}

async function main() {
  console.log('🌱 Seeding database with 50 random tender records...');

  try {
    // Generate 50 random tender records
    const tenderData = Array.from({ length: 50 }, (_, index) => 
      generateRandomTenderData(index)
    );
    
    console.log(`Generated ${tenderData.length} tender records`);

    // Insert the data in batches of 10
    const BATCH_SIZE = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < tenderData.length; i += BATCH_SIZE) {
      const batch = tenderData.slice(i, i + BATCH_SIZE);
      await db.insert(office_of_the_prime_minister_procurement).values(batch);
      insertedCount += batch.length;
      console.log(`✓ Inserted batch ${Math.floor(i/BATCH_SIZE) + 1} (${batch.length} records) - Total: ${insertedCount}`);
    }

    console.log('✅ Successfully seeded 50 random tender records!');
    console.log('\n📊 Summary:');
    console.log(`- Total records created: ${insertedCount}`);
    console.log(`- Reference numbers generated with current year: ${new Date().getFullYear()}`);
    console.log(`- Mix of statuses: Open, Closed, Awarded, etc.`);
    console.log(`- Various opening and closing dates spread across 9 months`);
    console.log(`- Random document and report assignments`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
