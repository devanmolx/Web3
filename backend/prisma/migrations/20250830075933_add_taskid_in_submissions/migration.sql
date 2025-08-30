/*
  Warnings:

  - A unique constraint covering the columns `[workerId,taskId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Submission" ADD COLUMN     "taskId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_workerId_taskId_key" ON "public"."Submission"("workerId", "taskId");
