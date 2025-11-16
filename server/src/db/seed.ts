import prisma from './client';

/**
 * Seed the database with sample data
 * Run with: npm run db:seed
 */
async function main() {
  console.log('🌱 Seeding database...\n');

  // Create sample users
  const users = [
    {
      walletAddress: '0x1234567890123456789012345678901234567890',
      nickname: 'Alice',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
    {
      walletAddress: '0x2345678901234567890123456789012345678901',
      nickname: 'Bob',
      avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
    },
    {
      walletAddress: '0x3456789012345678901234567890123456789012',
      nickname: 'Charlie',
      avatarUrl: null,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { walletAddress: userData.walletAddress },
      update: userData,
      create: userData,
    });

    console.log(`✅ Created/Updated user: ${user.walletAddress} (${user.nickname})`);
  }

  console.log('\n✨ Database seeded successfully!\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
