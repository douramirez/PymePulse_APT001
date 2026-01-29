/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,receiptNumber]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "receiptNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_organizationId_receiptNumber_key" ON "Sale"("organizationId", "receiptNumber");
