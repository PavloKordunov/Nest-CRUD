/*
  Warnings:

  - You are about to drop the column `Status` on the `User` table. All the data in the column will be lost.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Status",
ADD COLUMN     "status" "Status" NOT NULL;
