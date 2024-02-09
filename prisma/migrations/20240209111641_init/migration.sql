-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "surname" TEXT,
    "email" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT
);
INSERT INTO "new_User" ("email", "id", "lastSeen", "name", "organization", "surname") SELECT "email", "id", "lastSeen", "name", "organization", "surname" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
