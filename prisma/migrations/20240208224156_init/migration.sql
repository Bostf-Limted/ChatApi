/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderID" TEXT NOT NULL,
    "receiverID" TEXT NOT NULL,
    "organization" TEXT,
    CONSTRAINT "Channel_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("id", "organization", "receiverID", "senderID") SELECT "id", "organization", "receiverID", "senderID" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "lastCommented" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    "organization" TEXT,
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("attachment", "creatorID", "id", "isPrivate", "lastCommented", "name", "organization") SELECT "attachment", "creatorID", "id", "isPrivate", "lastCommented", "name", "organization" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_name_organization_key" ON "Group"("name", "organization");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT
);
INSERT INTO "new_User" ("id", "lastSeen", "organization") SELECT "id", "lastSeen", "organization" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
