/**
 * Database Seed Script
 *
 * Seed 20-30 sample students with assignments, call logs, and follow-ups
 * Run with: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { initializeDatabase } from '@/lib/db-init';
import StudentModel from '@/models/Student';
import AssignmentModel from '@/models/Assignment';
import CallLogModel from '@/models/CallLog';
import FollowUpModel from '@/models/FollowUp';

const SAMPLE_STUDENTS_DATA = [
  {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '03001234567',
    whatsapp: '03001234567',
    division: 'Sindh',
    district: 'Karachi',
    town: 'North Karachi',
    livingArea: 'Urban',
    occupation: 'Student',
    institute: 'IBA Karachi',
    educationalBackground: 'Intermediate',
    currentYear: '2nd Year',
    ageRange: '18-19',
    workingDevice: 'Laptop',
    currentStatus: 'On Track',
    lastCompletedAssignment: 'A-05',
    mentorshipJoiningStatus: true,
  },
  {
    name: 'Fatima Ali',
    email: 'fatima.ali@example.com',
    phone: '03021234567',
    whatsapp: '03021234567',
    division: 'Punjab',
    district: 'Lahore',
    town: 'DHA',
    livingArea: 'Urban',
    occupation: 'Student',
    institute: 'LUMS',
    educationalBackground: 'Intermediate',
    currentYear: '1st Year',
    ageRange: '17-18',
    workingDevice: 'Laptop',
    currentStatus: 'On Track',
    lastCompletedAssignment: 'A-03',
    mentorshipJoiningStatus: true,
  },
  {
    name: 'Hassan Raza',
    email: 'hassan.raza@example.com',
    phone: '03031234567',
    whatsapp: '03031234567',
    division: 'KPK',
    district: 'Peshawar',
    town: 'Hayatabad',
    livingArea: 'Urban',
    occupation: 'Student',
    institute: 'UET Peshawar',
    educationalBackground: 'Bachelor',
    currentYear: '2nd Year',
    ageRange: '20-25',
    workingDevice: 'Desktop',
    currentStatus: 'Behind',
    lastCompletedAssignment: 'A-02',
    mentorshipJoiningStatus: true,
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha.khan@example.com',
    phone: '03041234567',
    whatsapp: '03041234567',
    division: 'Sindh',
    district: 'Hyderabad',
    town: 'Latifabad',
    livingArea: 'Urban',
    occupation: 'Working',
    institute: 'HMEC',
    educationalBackground: 'Intermediate',
    currentYear: 'Part-time',
    ageRange: '26-30',
    workingDevice: 'Mobile',
    currentStatus: 'At Risk',
    lastCompletedAssignment: 'None',
    mentorshipJoiningStatus: false,
  },
  {
    name: 'Muhammad Usman',
    email: 'muhammad.usman@example.com',
    phone: '03051234567',
    whatsapp: '03051234567',
    division: 'Balochistan',
    district: 'Quetta',
    town: 'Satellite Town',
    livingArea: 'Urban',
    occupation: 'Student',
    institute: 'BU Quetta',
    educationalBackground: 'Bachelor',
    currentYear: '3rd Year',
    ageRange: '21-25',
    workingDevice: 'Laptop',
    currentStatus: 'On Track',
    lastCompletedAssignment: 'A-07',
    mentorshipJoiningStatus: true,
  },
  {
    name: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    phone: '03061234567',
    whatsapp: '03061234567',
    division: 'Sindh',
    district: 'Karachi',
    town: 'Clifton',
    livingArea: 'Urban',
    occupation: 'Professional',
    institute: 'Institute of Business Administration',
    educationalBackground: 'Bachelor',
    currentYear: 'Post Graduate',
    ageRange: '30-40',
    workingDevice: 'Laptop',
    currentStatus: 'Completed',
    lastCompletedAssignment: 'A-10',
    mentorshipJoiningStatus: false,
  },
  {
    name: 'Ali Hassan',
    email: 'ali.hassan@example.com',
    phone: '03071234567',
    whatsapp: '03071234567',
    division: 'Punjab',
    district: 'Islamabad',
    town: 'F-7',
    livingArea: 'Urban',
    occupation: 'Student',
    institute: 'FAST NUCES',
    educationalBackground: 'Bachelor',
    currentYear: '1st Year',
    ageRange: '18-19',
    workingDevice: 'Laptop',
    currentStatus: 'On Track',
    lastCompletedAssignment: 'A-04',
    mentorshipJoiningStatus: true,
  },
  {
    name: 'Zainab Ali',
    email: 'zainab.ali@example.com',
    phone: '03081234567',
    whatsapp: '03081234567',
    division: 'Sindh',
    district: 'Karachi',
    town: 'Gulshan',
    livingArea: 'Suburban',
    occupation: 'Student',
    institute: 'PAF-KIET',
    educationalBackground: 'Intermediate',
    currentYear: 'Final Year',
    ageRange: '19-20',
    workingDevice: 'Laptop',
    currentStatus: 'On Track',
    lastCompletedAssignment: 'A-06',
    mentorshipJoiningStatus: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Initialize database
    await initializeDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await StudentModel.deleteMany({});
    await AssignmentModel.deleteMany({});
    await CallLogModel.deleteMany({});
    await FollowUpModel.deleteMany({});

    // Seed students
    console.log('\n👥 Seeding students...');
    const students = await StudentModel.insertMany(SAMPLE_STUDENTS_DATA);
    console.log(`✅ Created ${students.length} students`);

    // Seed assignments for each student
    console.log('\n📝 Seeding assignments...');
    let assignmentCount = 0;
    for (const student of students) {
      const assignmentsToCreate = [];
      for (let i = 1; i <= Math.floor(Math.random() * 5) + 3; i++) {
        assignmentsToCreate.push({
          assignmentNumber: i,
          status: ['PENDING', 'SUBMITTED', 'COMPLETED'][Math.floor(Math.random() * 3)],
          completedDate:
            Math.random() > 0.5
              ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
              : undefined,
          notes: `Assignment ${i} notes`,
          studentId: student._id,
        });
      }
      const assignments = await AssignmentModel.insertMany(assignmentsToCreate);
      student.assignments = assignments.map((a) => a._id);
      assignmentCount += assignments.length;
    }
    console.log(`✅ Created ${assignmentCount} assignments`);

    // Seed call logs for each student
    console.log('\n📞 Seeding call logs...');
    let callLogCount = 0;
    for (const student of students) {
      const callLogsToCreate = [];
      for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
        const daysAgo = Math.floor(Math.random() * 60) + 1;
        callLogsToCreate.push({
          date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          status: ['RECEIVED', 'NOT_RECEIVED', 'PHONE_OFF'][Math.floor(Math.random() * 3)],
          notes: `Call log notes ${i + 1}`,
          calledBy: 'Mentor',
          issues: Math.random() > 0.5 ? 'No issues' : 'Some concerns about progress',
          promised: Math.random() > 0.5 ? 'Will complete next assignment' : 'Will attend session',
          studentId: student._id,
        });
      }
      const callLogs = await CallLogModel.insertMany(callLogsToCreate);
      student.callLogs = callLogs.map((c) => c._id);
      callLogCount += callLogs.length;
    }
    console.log(`✅ Created ${callLogCount} call logs`);

    // Seed follow-ups for each student
    console.log('\n⏰ Seeding follow-ups...');
    let followUpCount = 0;
    for (const student of students) {
      const followUpsToCreate = [];
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const daysFromNow = Math.floor(Math.random() * 30) + 1;
        followUpsToCreate.push({
          date: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
          note: `Follow-up reminder ${i + 1}`,
          studentId: student._id,
        });
      }
      const followUps = await FollowUpModel.insertMany(followUpsToCreate);
      student.followUps = followUps.map((f) => f._id);
      followUpCount += followUps.length;
    }
    console.log(`✅ Created ${followUpCount} follow-ups`);

    // Save student records with relations
    await Promise.all(students.map((student) => student.save()));

    // Print summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  Students: ${students.length}`);
    console.log(`  Assignments: ${assignmentCount}`);
    console.log(`  Call Logs: ${callLogCount}`);
    console.log(`  Follow-ups: ${followUpCount}`);
    console.log('\n✅ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // await closeDB();
  }
}

// Run the seed
seedDatabase();
