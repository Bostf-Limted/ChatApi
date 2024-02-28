-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessKey" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "AccessKey_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccessKey" ("enabled", "key", "projectID") SELECT "enabled", "key", "projectID" FROM "AccessKey";
DROP TABLE "AccessKey";
ALTER TABLE "new_AccessKey" RENAME TO "AccessKey";
CREATE UNIQUE INDEX "AccessKey_key_key" ON "AccessKey"("key");
CREATE UNIQUE INDEX "AccessKey_key_projectID_key" ON "AccessKey"("key", "projectID");
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "jwtAccessName" TEXT,
    "jwtAccessKey" TEXT,
    "developerID" TEXT NOT NULL,
    CONSTRAINT "Project_developerID_fkey" FOREIGN KEY ("developerID") REFERENCES "Developer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("developerID", "id", "jwtAccessKey", "jwtAccessName", "name") SELECT "developerID", "id", "jwtAccessKey", "jwtAccessName", "name" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_name_developerID_key" ON "Project"("name", "developerID");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT,
    "projectID" INTEGER NOT NULL,
    CONSTRAINT "User_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "lastSeen", "name", "organization", "phone", "projectID", "surname", "username") SELECT "email", "id", "lastSeen", "name", "organization", "phone", "projectID", "surname", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_id_projectID_organization_key" ON "User"("id", "projectID", "organization");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
