/*
  Warnings:

  - Added the required column `platform` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT,
    "platform" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id", "lastSeen", "name", "organization", "phone", "surname", "username") SELECT "email", "id", "lastSeen", "name", "organization", "phone", "surname", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_id_platform_organization_key" ON "User"("id", "platform", "organization");
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "lastCommented" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    "organization" TEXT,
    "platform" TEXT NOT NULL,
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("attachment", "creatorID", "id", "isPrivate", "lastCommented", "name", "organization") SELECT "attachment", "creatorID", "id", "isPrivate", "lastCommented", "name", "organization" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_platform_name_organization_key" ON "Group"("platform", "name", "organization");
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userOneID" TEXT NOT NULL,
    "userTwoID" TEXT NOT NULL,
    "organization" TEXT,
    "platform" TEXT NOT NULL,
    CONSTRAINT "Channel_userOneID_fkey" FOREIGN KEY ("userOneID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_userTwoID_fkey" FOREIGN KEY ("userTwoID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("id", "organization", "userOneID", "userTwoID") SELECT "id", "organization", "userOneID", "userTwoID" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_id_organization_platform_key" ON "Channel"("id", "organization", "platform");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
