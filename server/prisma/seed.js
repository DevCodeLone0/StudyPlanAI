import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
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
            icon: '7️⃣',
            requirement: JSON.stringify({ type: 'streak', value: 7 }),
        },
        {
            code: 'FAST_LEARNER',
            name: 'Fast Learner',
            description: 'Complete 10 milestones',
            icon: '⚡',
            requirement: JSON.stringify({ type: 'milestone_count', value: 10 }),
        },
        {
            code: 'DEDICATED',
            name: 'Dedicated',
            description: 'Maintain a 30-day streak',
            icon: '📚',
            requirement: JSON.stringify({ type: 'streak', value: 30 }),
        },
        {
            code: 'MASTER',
            name: 'Study Master',
            description: 'Complete your first plan',
            icon: '👑',
            requirement: JSON.stringify({ type: 'plan_completed', value: 1 }),
        },
        {
            code: 'LEVEL_5',
            name: 'Rising Star',
            description: 'Reach level 5',
            icon: '⭐',
            requirement: JSON.stringify({ type: 'level', value: 5 }),
        },
        {
            code: 'LEVEL_10',
            name: 'Expert',
            description: 'Reach level 10',
            icon: '🌟',
            requirement: JSON.stringify({ type: 'level', value: 10 }),
        },
        {
            code: 'NIGHT_OWL',
            name: 'Night Owl',
            description: 'Study after 10 PM',
            icon: '🦉',
            requirement: JSON.stringify({ type: 'special', value: 'night_study' }),
        },
    ];
    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { code: badge.code },
            update: badge,
            create: badge,
        });
    }
    console.log(`✅ Created ${badges.length} badges`);
    // Create admin user
    const adminEmail = 'admin@studyplanai.com';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const bcrypt = await import('bcrypt');
        const passwordHash = await bcrypt.hash('admin123', 12);
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'Admin',
                role: 'ADMIN',
                xp: 0,
                level: 1,
            },
        });
        console.log('✅ Created admin user (admin@studyplanai.com / admin123)');
    }
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map