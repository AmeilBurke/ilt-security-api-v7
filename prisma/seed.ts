import { PrismaClient, Role, BanDuration, BanStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // CREATE VENUES
  // ============================================
  console.log('Creating venues...');
  
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Blue Moon Lounge',
      imagePath: '/uploads/venues/blue-moon.jpg',
      address: '123 Main St, Downtown',
      phone: '555-0100',
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Red Dragon Bar',
      imagePath: '/uploads/venues/red-dragon.jpg',
      address: '456 Oak Ave, Midtown',
      phone: '555-0200',
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Green Lounge',
      imagePath: '/uploads/venues/green-lounge.jpg',
      address: '789 Pine Rd, Uptown',
      phone: '555-0300',
    },
  });

  console.log('✅ Created 3 venues');

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('Creating users...');

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bansystem.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Venue Manager for Blue Moon (manages 2 venues)
  const venueManager1 = await prisma.user.create({
    data: {
      email: 'sarah@bansystem.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: Role.VENUE_MANAGER,
      venueManagerAssignments: {
        create: [
          { venueId: venue1.id },
          { venueId: venue2.id },
        ],
      },
    },
  });

  // Venue Manager for Green Lounge
  const venueManager2 = await prisma.user.create({
    data: {
      email: 'mike@bansystem.com',
      password: hashedPassword,
      name: 'Mike Chen',
      role: Role.VENUE_MANAGER,
      venueManagerAssignments: {
        create: [{ venueId: venue3.id }],
      },
    },
  });

  // Duty Manager (can view 2 venues)
  const dutyManager = await prisma.user.create({
    data: {
      email: 'alex@bansystem.com',
      password: hashedPassword,
      name: 'Alex Rivera',
      role: Role.DUTY_MANAGER,
      dutyManagerAssignments: {
        create: [
          { venueId: venue1.id },
          { venueId: venue2.id },
        ],
      },
    },
  });

  // Bouncers (work at all venues)
  const bouncer1 = await prisma.user.create({
    data: {
      email: 'john@bansystem.com',
      password: hashedPassword,
      name: 'John Smith',
      role: Role.BOUNCER,
    },
  });

  const bouncer2 = await prisma.user.create({
    data: {
      email: 'emma@bansystem.com',
      password: hashedPassword,
      name: 'Emma Davis',
      role: Role.BOUNCER,
    },
  });

  console.log('✅ Created 6 users');

  // ============================================
  // CREATE BANNED PEOPLE
  // ============================================
  console.log('Creating banned people...');

  const person1 = await prisma.bannedPerson.create({
    data: {
      name: 'John Doe',
      imagePath: '/uploads/banned/john-doe.jpg',
    },
  });

  const person2 = await prisma.bannedPerson.create({
    data: {
      name: 'Jane Smith',
      imagePath: '/uploads/banned/jane-smith.jpg',
    },
  });

  const person3 = await prisma.bannedPerson.create({
    data: {
      name: 'Bob Williams',
      imagePath: '/uploads/banned/bob-williams.jpg',
    },
  });

  console.log('✅ Created 3 banned people');

  // ============================================
  // CREATE BANS
  // ============================================
  console.log('Creating bans...');

  // Ban 1: APPROVED blanket ban (banned from all venues)
  const ban1 = await prisma.ban.create({
    data: {
      personId: person1.id,
      createdById: bouncer1.id,
      reason: 'Physical altercation with staff',
      notes: 'Threw glass at bartender, police called',
      incidentDate: new Date('2026-01-15'),
      initialDuration: BanDuration.SIX_MONTHS,
      isBlanketBan: true,
      status: BanStatus.APPROVED,
      venueBans: {
        create: [
          {
            venueId: venue1.id,
            startDate: new Date('2026-01-15'),
            endDate: new Date('2026-07-15'),
            isActive: true,
          },
          {
            venueId: venue2.id,
            startDate: new Date('2026-01-15'),
            endDate: new Date('2026-07-15'),
            isActive: true,
          },
          {
            venueId: venue3.id,
            startDate: new Date('2026-01-15'),
            endDate: new Date('2026-07-15'),
            isActive: true,
          },
        ],
      },
    },
  });

  // Ban 2: PENDING ban (waiting for approval)
  const ban2 = await prisma.ban.create({
    data: {
      personId: person2.id,
      createdById: bouncer2.id,
      reason: 'Disorderly conduct',
      notes: 'Refused to leave after closing time, verbally abusive',
      incidentDate: new Date('2026-02-10'),
      initialDuration: BanDuration.THREE_MONTHS,
      isBlanketBan: false,
      status: BanStatus.PENDING,
      venueBans: {
        create: [
          {
            venueId: venue1.id,
            startDate: new Date('2026-02-10'),
            endDate: new Date('2026-05-10'),
            isActive: false, // Not active until approved
          },
        ],
      },
    },
  });

  // Ban 3: APPROVED venue-specific ban (only banned from venue 2)
  const ban3 = await prisma.ban.create({
    data: {
      personId: person3.id,
      createdById: bouncer1.id,
      reason: 'Underage drinking',
      notes: 'Caught with fake ID',
      incidentDate: new Date('2026-02-01'),
      initialDuration: BanDuration.ONE_YEAR,
      isBlanketBan: false,
      status: BanStatus.APPROVED,
      venueBans: {
        create: [
          {
            venueId: venue2.id,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2027-02-01'),
            isActive: true,
          },
        ],
      },
    },
  });

  console.log('✅ Created 3 bans');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 3 Venues');
  console.log('  - 6 Users (1 Admin, 2 Venue Managers, 1 Duty Manager, 2 Bouncers)');
  console.log('  - 3 Banned People');
  console.log('  - 3 Bans (1 blanket approved, 1 pending, 1 venue-specific approved)');
  console.log('\n🔐 Login Credentials:');
  console.log('  Email: admin@bansystem.com | Password: password123 | Role: ADMIN');
  console.log('  Email: sarah@bansystem.com | Password: password123 | Role: VENUE_MANAGER');
  console.log('  Email: mike@bansystem.com  | Password: password123 | Role: VENUE_MANAGER');
  console.log('  Email: alex@bansystem.com  | Password: password123 | Role: DUTY_MANAGER');
  console.log('  Email: john@bansystem.com  | Password: password123 | Role: BOUNCER');
  console.log('  Email: emma@bansystem.com  | Password: password123 | Role: BOUNCER');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });