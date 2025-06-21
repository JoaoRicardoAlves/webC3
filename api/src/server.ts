// api/src/server.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // Permite que o frontend acesse a API
app.use(express.json());

// Endpoint para os cartões principais
app.get('/api/metrics', async (req, res) => {
  // Em uma aplicação real, você teria lógica para buscar/calcular isso.
  // Aqui vamos usar um dado mockado ou o primeiro que encontrar.
  const metrics = await prisma.dashboardMetric.findFirst();
  res.json(metrics);
});

// Endpoint para a lista de projetos
app.get('/api/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' }
  });
  res.json(projects);
});

// Endpoint para as fontes de receita (gráfico)
app.get('/api/revenue-sources', async (req, res) => {
    const sources = await prisma.revenueSource.findMany();
    res.json(sources);
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});