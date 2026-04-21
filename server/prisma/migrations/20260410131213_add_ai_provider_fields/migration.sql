-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "aiProvider" TEXT NOT NULL DEFAULT 'openai',
ADD COLUMN     "embeddingDim" INTEGER NOT NULL DEFAULT 1536;
