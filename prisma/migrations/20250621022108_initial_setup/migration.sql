-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardMetric" (
    "id" TEXT NOT NULL,
    "earningsMonthly" DECIMAL(65,30) NOT NULL,
    "earningsAnnual" DECIMAL(65,30) NOT NULL,
    "tasksPercentage" INTEGER NOT NULL,
    "pendingRequests" INTEGER NOT NULL,

    CONSTRAINT "DashboardMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueSource" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "RevenueSource_pkey" PRIMARY KEY ("id")
);
