/*
  Warnings:

  - Added the required column `jwtAccessKey` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "jwtAccessKey" TEXT NOT NULL,
    "developerID" TEXT NOT NULL,
    CONSTRAINT "Project_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("developerID", "id", "name") SELECT "developerID", "id", "name" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_name_developerID_key" ON "Project"("name", "developerID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
