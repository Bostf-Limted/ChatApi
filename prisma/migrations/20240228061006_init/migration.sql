/*
  Warnings:

  - Made the column `jwtAccessKey` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jwtAccessName` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "jwtAccessName" TEXT NOT NULL,
    "jwtAccessKey" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,
    CONSTRAINT "Project_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("developerID", "id", "jwtAccessKey", "jwtAccessName", "name") SELECT "developerID", "id", "jwtAccessKey", "jwtAccessName", "name" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_name_developerID_key" ON "Project"("name", "developerID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
