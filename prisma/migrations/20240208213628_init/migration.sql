-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization" TEXT NOT NULL DEFAULT 'public',

    PRIMARY KEY ("id", "organization")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "senderID" TEXT NOT NULL,
    "channelID" INTEGER NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "Chat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderID" TEXT NOT NULL,
    "receiverID" TEXT NOT NULL,
    "organization" TEXT NOT NULL DEFAULT 'public',
    CONSTRAINT "Channel_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "lastCommented" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    "organization" TEXT NOT NULL DEFAULT 'public',
    CONSTRAINT "Group_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "senderID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "GroupChat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "GroupChat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,

    PRIMARY KEY ("userID", "groupID"),
    CONSTRAINT "Member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Member_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
