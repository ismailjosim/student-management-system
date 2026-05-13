/**
 * Migration Template
 *
 * Copy this template and rename it with timestamp (e.g., 001_initial_schema.ts)
 * Update the migrate and rollback functions with your migration logic
 */

import { connectDB, closeDB } from '@/lib/mongodb';
import StudentModel from '@/models/Student';

export const version = '1.0.0';
export const description = 'Initial schema migration';

export async function migrate() {
  try {
    await connectDB();

    console.log('📦 Running migration...');

    // Add your migration logic here
    // Example: await StudentModel.updateMany({}, { $set: { newField: defaultValue } });

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

export async function rollback() {
  try {
    await connectDB();

    console.log('🔄 Rolling back migration...');

    // Add your rollback logic here
    // Example: await StudentModel.updateMany({}, { $unset: { newField: 1 } });

    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}
