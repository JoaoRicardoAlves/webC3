import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Limpa os dados antigos para evitar duplicatas
  await prisma.project.deleteMany();
  await prisma.revenueSource.deleteMany();
  await prisma.dashboardMetric.deleteMany();
  console.log('Old data cleared.');

  // Cria as métricas principais
  await prisma.dashboardMetric.create({
    data: {
      earningsMonthly: 40000,
      earningsAnnual: 215000,
      tasksPercentage: 50,
      pendingRequests: 18,
    },
  });
  console.log('Dashboard metrics created.');

  // Cria os projetos
  await prisma.project.createMany({
    data: [
      { name: 'Server Migration', progress: 20 },
      { name: 'Sales Tracking', progress: 40 },
      { name: 'Customer Database', progress: 60 },
      { name: 'Payout Details', progress: 80 },
      { name: 'Account Setup', progress: 100 },
    ],
  });
  console.log('Projects created.');

  // Cria as fontes de receita para o gráfico
  await prisma.revenueSource.createMany({
    data: [
      { sourceName: 'Direct', value: 55 },
      { sourceName: 'Social', value: 30 },
      { sourceName: 'Referral', value: 15 },
    ],
  });
  console.log('Revenue sources created.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });