-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    PRIMARY KEY ("userID", "groupID"),
    CONSTRAINT "Member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("groupID", "joined", "userID") SELECT "groupID", "joined", "userID" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
