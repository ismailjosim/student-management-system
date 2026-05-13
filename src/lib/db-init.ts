import { connectDB, isConnected } from './mongodb';
import StudentModel from '@/models/Student';
import AssignmentModel from '@/models/Assignment';
import CallLogModel from '@/models/CallLog';
import FollowUpModel from '@/models/FollowUp';

/**
 * Initialize all database models and create indexes
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Connect to database
    await connectDB();

    if (!isConnected()) {
      throw new Error('Failed to connect to MongoDB');
    }

    console.log('🔧 Initializing database...');

    // Initialize all models (ensures they are registered)
    const models = [
      { name: 'Student', model: StudentModel },
      { name: 'Assignment', model: AssignmentModel },
      { name: 'CallLog', model: CallLogModel },
      { name: 'FollowUp', model: FollowUpModel },
    ];

    // Verify models exist
    for (const { name, model } of models) {
      console.log(`  ✓ Model registered: ${name}`);
    }

    // Create indexes
    await createIndexes();

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create all necessary database indexes
 */
export async function createIndexes(): Promise<void> {
  try {
    console.log('📊 Creating indexes...');

    // Student indexes
    await StudentModel.collection.createIndex({ email: 1, currentStatus: 1 });
    await StudentModel.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Student indexes created');

    // Assignment indexes
    await AssignmentModel.collection.createIndex(
      { studentId: 1, assignmentNumber: 1 },
      { unique: true }
    );
    await AssignmentModel.collection.createIndex({ status: 1 });
    console.log('  ✓ Assignment indexes created');

    // CallLog indexes
    await CallLogModel.collection.createIndex({ studentId: 1 });
    await CallLogModel.collection.createIndex({ date: -1 });
    console.log('  ✓ CallLog indexes created');

    // FollowUp indexes
    await FollowUpModel.collection.createIndex({ studentId: 1 });
    await FollowUpModel.collection.createIndex({ date: -1 });
    console.log('  ✓ FollowUp indexes created');

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    throw error;
  }
}

/**
 * Verify database connection and collections
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    await connectDB();

    if (!isConnected()) {
      console.error('❌ Not connected to MongoDB');
      return false;
    }

    console.log('✅ MongoDB connection verified');
    return true;
  } catch (error) {
    console.error('❌ Connection verification failed:', error);
    return false;
  }
}

/**
 * Drop all collections (use with caution - development only)
 */
export async function dropAllCollections(): Promise<void> {
  try {
    await connectDB();

    const collections = [
      StudentModel.collection,
      AssignmentModel.collection,
      CallLogModel.collection,
      FollowUpModel.collection,
    ];

    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`  ✓ Cleared collection: ${collection.name}`);
    }

    console.log('✅ All collections cleared');
  } catch (error) {
    console.error('❌ Failed to clear collections:', error);
    throw error;
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(): Promise<Record<string, number>> {
  try {
    await connectDB();

    const stats: Record<string, number> = {};

    const collections = [
      { name: 'Student', model: StudentModel },
      { name: 'Assignment', model: AssignmentModel },
      { name: 'CallLog', model: CallLogModel },
      { name: 'FollowUp', model: FollowUpModel },
    ];

    for (const { name, model } of collections) {
      const count = await model.countDocuments();
      stats[name] = count;
    }

    return stats;
  } catch (error) {
    console.error('❌ Failed to get collection stats:', error);
    throw error;
  }
}
