import { connectDB } from '../src/lib/mongodb';
import User from '../src/models/User';

async function seedUsers() {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('✓ Cleared existing users');

    const users = [
      {
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by the model
        name: 'Admin User',
        role: 'admin' as const,
        isActive: true,
      },
      {
        email: 'coordinator@example.com',
        password: 'password123',
        name: 'Coordinator User',
        role: 'coordinator' as const,
        isActive: true,
      },
      {
        email: 'viewer@example.com',
        password: 'password123',
        name: 'Viewer User',
        role: 'viewer' as const,
        isActive: true,
      },
    ];

    let createdCount = 0;
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⊘ User ${userData.email} already exists, skipping...`);
      } else {
        const user = await User.create(userData);
        createdCount++;
        console.log(`✓ Created user: ${user.email} (${user.role})`);
      }
    }

    console.log(`\n✓ Seed complete! Created ${createdCount} new user(s).`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
