/*
  Warnings:

  - A unique constraint covering the columns `[userOneID,userTwoID,organization,platform]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Channel_id_organization_platform_key";

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userOneID_userTwoID_organization_platform_key" ON "Channel"("userOneID", "userTwoID", "organization", "platform");
