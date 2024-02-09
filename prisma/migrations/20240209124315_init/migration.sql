/*
  Warnings:

  - You are about to drop the column `receiverID` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `senderID` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `friendID` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userID" TEXT NOT NULL,
    "friendID" TEXT NOT NULL,
    "organization" TEXT,
    CONSTRAINT "Channel_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_friendID_fkey" FOREIGN KEY ("friendID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("id", "organization") SELECT "id", "organization" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
