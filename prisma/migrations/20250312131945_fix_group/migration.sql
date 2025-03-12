/*
  Warnings:

  - A unique constraint covering the columns `[userId,groupId]` on the table `GroupSubsription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GroupSubsription_userId_groupId_key" ON "GroupSubsription"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
