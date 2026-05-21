/*
  Warnings:

  - You are about to drop the column `isDefault` on the `WorkPoint` table. All the data in the column will be lost.
  - You are about to drop the column `team_leader_id` on the `WorkPoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkPoint" DROP COLUMN "isDefault",
DROP COLUMN "team_leader_id";
