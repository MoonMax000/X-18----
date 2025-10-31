import 'dotenv/config';
import { seedUsers } from './users.seed';

async function runSeeds() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Seed users
    await seedUsers();

    console.log('\n✅ All seeds completed successfully!');
    console.log('\n📌 What was created:');
    console.log('- 50 test users with profiles');
    console.log('- Usernames from tyrian_trade to various trader names');
    console.log('- All users have password: Test123!@#');
    console.log('\n🔗 Access profiles at:');
    console.log('- /profile/tyrian_trade');
    console.log('- /profile/crypto_analyst');
    console.log('- /profile/{any_username}');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
