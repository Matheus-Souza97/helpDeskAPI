/*
  Warnings:

  - Added the required column `finalPrice` to the `ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialPrice` to the `ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "finalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "initialPrice" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "ticket_assignments" ADD COLUMN     "additionalServices" TEXT[],
ADD COLUMN     "total" DECIMAL(65,30);
