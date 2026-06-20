-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PLAYING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW');

-- Align existing rating defaults with the Prisma schema.
ALTER TABLE "users" ALTER COLUMN "rating" SET DEFAULT 1200;

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "whitePlayerId" TEXT NOT NULL,
    "whitePlayerUsername" TEXT NOT NULL,
    "blackPlayerId" TEXT NOT NULL,
    "blackPlayerUsername" TEXT NOT NULL,
    "winnerId" TEXT,
    "result" "GameResult",
    "status" "GameStatus" NOT NULL DEFAULT 'PLAYING',
    "reason" TEXT,
    "finalFen" TEXT,
    "pgn" TEXT,
    "moves" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_roomId_key" ON "games"("roomId");

-- CreateIndex
CREATE INDEX "games_whitePlayerId_idx" ON "games"("whitePlayerId");

-- CreateIndex
CREATE INDEX "games_blackPlayerId_idx" ON "games"("blackPlayerId");

-- CreateIndex
CREATE INDEX "games_winnerId_idx" ON "games"("winnerId");

-- CreateIndex
CREATE INDEX "games_status_idx" ON "games"("status");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
