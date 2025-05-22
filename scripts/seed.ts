import { db } from '../database/drizzle';
import { office_of_the_prime_minister_procurement } from '../database/schema';
import fs from 'fs';
import path from 'path';
import { parse, isValid } from 'date-fns';

async function main() {
  console.log('🌱 Seeding database with OPM procurement data...');

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'lib', 'opm_masterfile.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const procurements = JSON.parse(jsonData);
    
    console.log(`Found ${procurements.length} procurement records to import`);

    // Parse and transform the data
    const transformedData = procurements.map((item: any) => {
      // Parse date strings to proper Date objects
      let openingDate = null;
      let closingDate = null;
      
      try {
        if (item['Opening Date']) {
          // Parse the date string
          const parsedDate = parse(item['Opening Date'], 'dd MMMM yyyy', new Date(2000, 0, 1));
          
          // Validate the date before using it
          if (isValid(parsedDate)) {
            openingDate = parsedDate;
          } else {
            console.warn(`Parsed opening date is invalid: ${item['Opening Date']}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse opening date: ${item['Opening Date']}`);
      }

      try {
        if (item['Closing Date']) {
          // Clean up the closing date string to handle variations
          const closingDateStr = item['Closing Date']
            .replace(/@.*$/, '') // Remove time part like "@10H00 a.m local time"
            .trim();
            
          // Parse the date string
          const parsedDate = parse(closingDateStr, 'dd MMMM yyyy', new Date(2000, 0, 1));
          
          // Validate the date before using it
          if (isValid(parsedDate)) {
            closingDate = parsedDate;
          } else {
            console.warn(`Parsed closing date is invalid: ${closingDateStr}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse closing date: ${item['Closing Date']}`);
      }

      return {
        title: item.title,
        bid_document: item.bid_document,
        bid_document_s3_key: item.bid_document_s3_key,
        status: item.status || 'Unknown',
        opening_date: openingDate,
        closing_date: closingDate,
        bid_report: item.bid_report,
        bid_report_s3_key: item.bid_report_s3_key,
        amendments: item.amendments,
        ref_number: item.ref_number,
        bid_document_cdn_url: item.bid_document_cdn_url,
        bid_report_cdn_url: item.bid_report_cdn_url,
      };
    });

    // Insert the data in batches
    const BATCH_SIZE = 20;
    for (let i = 0; i < transformedData.length; i += BATCH_SIZE) {
      const batch = transformedData.slice(i, i + BATCH_SIZE);
      await db.insert(office_of_the_prime_minister_procurement).values(batch);
      console.log(`Inserted batch ${i/BATCH_SIZE + 1} (${batch.length} records)`);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  // Note: We're not closing the connection because the Neon serverless client doesn't have an end() method
  // The connection will automatically close when the script exits
}

main();
