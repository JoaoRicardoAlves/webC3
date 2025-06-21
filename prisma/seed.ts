import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.revenueSource.deleteMany();
  await prisma.dashboardMetric.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old data cleared.');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER',
    },
  });

  console.log('Demo users created.');

  // Create dashboard metrics
  await prisma.dashboardMetric.create({
    data: {
      earningsMonthly: 40000,
      earningsAnnual: 215000,
      tasksPercentage: 75,
      pendingRequests: 12,
    },
  });
  console.log('Dashboard metrics created.');

  // Create revenue sources
  await prisma.revenueSource.createMany({
    data: [
      { sourceName: 'Direct', value: 55, color: '#3b82f6' },
      { sourceName: 'Social', value: 30, color: '#10b981' },
      { sourceName: 'Referral', value: 15, color: '#f59e0b' },
    ],
  });
  console.log('Revenue sources created.');

  // Create projects for admin user
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform with React and Node.js',
        progress: 75,
        status: 'ACTIVE',
        priority: 'HIGH',
        userId: adminUser.id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile app using React Native',
        progress: 45,
        status: 'ACTIVE',
        priority: 'MEDIUM',
        userId: adminUser.id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-15'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Database Migration',
        description: 'Migrating legacy database to PostgreSQL',
        progress: 90,
        status: 'ACTIVE',
        priority: 'URGENT',
        userId: adminUser.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Documentation',
        description: 'Creating comprehensive API documentation',
        progress: 100,
        status: 'COMPLETED',
        priority: 'LOW',
        userId: adminUser.id,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-01-31'),
      },
    }),
  ]);

  console.log('Projects created.');

  // Create tasks for projects
  const tasks = [];
  for (const project of projects) {
    const projectTasks = await Promise.all([
      prisma.task.create({
        data: {
          title: `Setup ${project.name} environment`,
          description: 'Initialize development environment and dependencies',
          completed: true,
          priority: 'HIGH',
          projectId: project.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      }),
      prisma.task.create({
        data: {
          title: `Design ${project.name} architecture`,
          description: 'Create system architecture and database design',
          completed: project.status === 'COMPLETED',
          priority: 'MEDIUM',
          projectId: project.id,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      }),
      prisma.task.create({
        data: {
          title: `Implement core features for ${project.name}`,
          description: 'Develop main functionality and features',
          completed: false,
          priority: 'HIGH',
          projectId: project.id,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        },
      }),
    ]);
    tasks.push(...projectTasks);
  }

  console.log('Tasks created.');

  // Create activities
  const activities = [
    {
      type: 'USER_REGISTERED',
      title: 'User registered',
      description: `New user ${adminUser.firstName} ${adminUser.lastName} registered`,
      userId: adminUser.id,
    },
    {
      type: 'PROJECT_CREATED',
      title: 'Project created',
      description: `Created project: ${projects[0].name}`,
      userId: adminUser.id,
      projectId: projects[0].id,
    },
    {
      type: 'TASK_COMPLETED',
      title: 'Task completed',
      description: `Completed task: ${tasks[0].title}`,
      userId: adminUser.id,
      projectId: projects[0].id,
    },
    {
      type: 'PROJECT_UPDATED',
      title: 'Project updated',
      description: `Updated project: ${projects[1].name}`,
      userId: adminUser.id,
      projectId: projects[1].id,
    },
    {
      type: 'PROJECT_COMPLETED',
      title: 'Project completed',
      description: `Completed project: ${projects[3].name}`,
      userId: adminUser.id,
      projectId: projects[3].id,
    },
  ];

  await prisma.activity.createMany({
    data: activities,
  });

  console.log('Activities created.');

  // Create some projects for regular user
  await prisma.project.create({
    data: {
      name: 'Personal Website',
      description: 'Building a personal portfolio website',
      progress: 30,
      status: 'ACTIVE',
      priority: 'LOW',
      userId: regularUser.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-31'),
    },
  });

  console.log('Regular user projects created.');
  console.log('Seeding finished.');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@example.com / password123');
  console.log('User: user@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });