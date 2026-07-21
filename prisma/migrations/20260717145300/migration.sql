-- CreateEnum
CREATE TYPE "StatusTicketRole" AS ENUM ('open', 'in_progress', 'closed');

-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "status" "StatusTicketRole" NOT NULL DEFAULT 'open';
