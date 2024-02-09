/*
  Warnings:

  - A unique constraint covering the columns `[name,organization]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Group_name_organization_key" ON "Group"("name", "organization");
