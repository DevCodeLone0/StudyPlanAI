import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create badges
  const badges = [
    {
      code: 'FIRST_STEPS',
      name: 'First Steps',
      description: 'Complete your first milestone',
      icon: '👣',
      requirement: JSON.stringify({ type: 'milestone_count', value: 1 }),
    },
    {
      code: 'WEEK_WARRIOR',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      requirement: JSON.stringify({ type: 'streak', value: 7 }),
    },
    {
      code: 'MONTH_MASTER',
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      requirement: JSON.stringify({ type: 'streak', value: 30 }),
    },
    {
      code: 'LEVEL_UP_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      requirement: JSON.stringify({ type: 'level', value: 5 }),
    },
    {
      code: 'LEVEL_UP_10',
      name: 'Expert',
      description: 'Reach level 10',
      icon: '🌟',
      requirement: JSON.stringify({ type: 'level', value: 10 }),
    },
    {
      code: 'PLAN_MASTER',
      name: 'Study Master',
      description: 'Complete your first plan',
      icon: '👑',
      requirement: JSON.stringify({ type: 'plan_completed', value: 1 }),
    },
    {
      code: 'MILESTONE_10',
      name: 'Fast Learner',
      description: 'Complete 10 milestones',
      icon: '⚡',
      requirement: JSON.stringify({ type: 'milestone_count', value: 10 }),
    },
    {
      code: 'MILESTONE_50',
      name: 'Dedicated Scholar',
      description: 'Complete 50 milestones',
      icon: '🏆',
      requirement: JSON.stringify({ type: 'milestone_count', value: 50 }),
    },
  ]
  
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    })
  }
  
  console.log(`✅ Created ${badges.length} badges`)

  // Create rewards
  const rewards = [
    {
      name: 'Dark Theme',
      description: 'Unlock a sleek dark theme for your dashboard',
      cost: 500,
      icon: '🎨',
      category: 'theme',
    },
    {
      name: 'Avatar Pack',
      description: 'Get 5 unique avatar icons',
      cost: 1000,
      icon: '👤',
      category: 'avatar',
    },
    {
      name: '"Master" Title',
      description: 'Display the "Master" title on your profile',
      cost: 2000,
      icon: '🏅',
      category: 'title',
    },
    {
      name: 'Confetti Effect',
      description: 'Enhanced confetti animation for celebrations',
      cost: 1500,
      icon: '🎊',
      category: 'effect',
    },
    {
      name: 'Custom Badge Frame',
      description: 'Unlock a golden frame for your badges',
      cost: 3000,
      icon: '🖼️',
      category: 'effect',
    },
    {
      name: 'Neon Theme',
      description: 'Futuristic neon theme for your dashboard',
      cost: 2500,
      icon: '💡',
      category: 'theme',
    },
  ]

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: reward.name.toLowerCase().replace(/\s+/g, '-') },
      update: reward,
      create: {
        ...reward,
        id: reward.name.toLowerCase().replace(/\s+/g, '-'),
      },
    })
  }

  console.log(`✅ Created ${rewards.length} rewards`)
  
  // Create admin user
  const adminEmail = 'admin@studyplanai.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })
  
  if (!existingAdmin) {
    const bcrypt = await import('bcrypt')
    const passwordHash = await bcrypt.hash('admin123', 12)
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'ADMIN',
        xp: 0,
        level: 1,
      },
    })
    
    console.log('✅ Created admin user (admin@studyplanai.com / admin123)')
  }
  
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
