-- CreateTable
CREATE TABLE IF NOT EXISTS "house_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "house_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "vacation_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "house_members_user_id_house_id_key" ON "house_members"("user_id", "house_id");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'house_members_user_id_fkey') THEN
        ALTER TABLE "house_members" ADD CONSTRAINT "house_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'house_members_house_id_fkey') THEN
        ALTER TABLE "house_members" ADD CONSTRAINT "house_members_house_id_fkey" FOREIGN KEY ("house_id") REFERENCES "houses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Preencher retroativamente a tabela house_members para todos os usuários com vínculo residencial
INSERT INTO "house_members" ("id", "user_id", "house_id", "role", "vacation_mode", "created_at", "updated_at")
SELECT 
    gen_random_uuid()::text,
    u."id",
    u."house_id",
    u."role",
    u."vacation_mode",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users" u
WHERE u."house_id" IS NOT NULL
ON CONFLICT ("user_id", "house_id") DO NOTHING;
