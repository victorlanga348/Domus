-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_houses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_houses" ("created_at", "id", "invite_code", "name", "updated_at") SELECT "created_at", "id", "invite_code", "name", "updated_at" FROM "houses";
DROP TABLE "houses";
ALTER TABLE "new_houses" RENAME TO "houses";
CREATE UNIQUE INDEX "houses_invite_code_key" ON "houses"("invite_code");
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shift" TEXT NOT NULL DEFAULT 'MORNING',
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "last_block_reason" TEXT,
    "locked_at" DATETIME,
    "locked_by_id" TEXT,
    "rotation_index" INTEGER NOT NULL DEFAULT 0,
    "creator_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_locked_by_id_fkey" FOREIGN KEY ("locked_by_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("created_at", "creator_id", "description", "frequency", "house_id", "id", "last_block_reason", "locked_at", "locked_by_id", "rotation_index", "shift", "status", "title", "updated_at") SELECT "created_at", "creator_id", "description", "frequency", "house_id", "id", "last_block_reason", "locked_at", "locked_by_id", "rotation_index", "shift", "status", "title", "updated_at" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "vacation_mode" BOOLEAN NOT NULL DEFAULT false,
    "house_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("created_at", "email", "house_id", "id", "name", "password_hash", "pin_hash", "updated_at", "vacation_mode") SELECT "created_at", "email", "house_id", "id", "name", "password_hash", "pin_hash", "updated_at", "vacation_mode" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
