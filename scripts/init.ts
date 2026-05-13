/**
 * Database Initialization Script
 *
 * Initialize the database with all models and indexes
 * Run with: npm run db:init
 */

import { initializeDatabase, getCollectionStats } from '@/lib/db-init';
import { closeDB } from '@/lib/mongodb';

async function main() {
  try {
    console.log('🔧 Initializing database...\n');

    await initializeDatabase();

    // Get collection stats
    const stats = await getCollectionStats();

    console.log('\n📊 Collection Statistics:');
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n✅ Database initialization completed successfully!\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

main();
