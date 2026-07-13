-- AlterTable
ALTER TABLE "games" ADD COLUMN     "initialTimeMs" INTEGER NOT NULL DEFAULT 600000,
ADD COLUMN     "timeControl" TEXT NOT NULL DEFAULT 'rapid';
