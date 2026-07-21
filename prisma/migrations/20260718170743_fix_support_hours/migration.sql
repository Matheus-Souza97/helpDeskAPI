/*
  Warnings:

  - The `supportHours` column on the `supports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "supports" DROP COLUMN "supportHours",
ADD COLUMN     "supportHours" TEXT[];
