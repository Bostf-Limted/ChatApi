-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "roomID" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "senderID" TEXT NOT NULL,
    "channelID" INTEGER NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "Chat_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderID" TEXT NOT NULL,
    "receiverID" TEXT NOT NULL,
    CONSTRAINT "Channel_senderID_fkey" FOREIGN KEY ("senderID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Channel_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "lastCommented" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachment" TEXT,
    "creatorID" TEXT NOT NULL,
    CONSTRAINT "Groups_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "referenceID" INTEGER,
    CONSTRAINT "GroupChat_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupChat_referenceID_fkey" FOREIGN KEY ("referenceID") REFERENCES "GroupChat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Members" (
    "userID" TEXT NOT NULL,
    "groupID" INTEGER NOT NULL,

    PRIMARY KEY ("userID", "groupID"),
    CONSTRAINT "Members_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Members_groupID_fkey" FOREIGN KEY ("groupID") REFERENCES "Groups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");
