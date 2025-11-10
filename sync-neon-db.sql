-- Script de synchronisation pour la base de données Neon
-- Exécutez ce script dans le SQL Editor de Neon

-- Créer les ENUMs s'ils n'existent pas
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('GUEST', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GuestStatus" AS ENUM ('PENDING', 'INVITED', 'RESPONDED', 'BOUNCED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EmailType" AS ENUM ('SAVE_THE_DATE', 'INVITE', 'INVITATION', 'REMINDER', 'CONFIRMATION', 'INFO', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EmailProvider" AS ENUM ('SENDGRID', 'RESEND', 'MAILGUN', 'SMTP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Créer ou modifier la table User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$
BEGIN
    -- Ajouter name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='name') THEN
        ALTER TABLE "User" ADD COLUMN "name" TEXT;
    END IF;

    -- Ajouter password si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='password') THEN
        ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
    END IF;

    -- Ajouter role si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='role') THEN
        ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';
    END IF;

    -- Ajouter isActive si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='isActive') THEN
        ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Ajouter lastLoginAt si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='lastLoginAt') THEN
        ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
    END IF;

    -- Ajouter loginAttempts si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='loginAttempts') THEN
        ALTER TABLE "User" ADD COLUMN "loginAttempts" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Ajouter lockedUntil si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='lockedUntil') THEN
        ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);
    END IF;

    -- Ajouter createdAt si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='createdAt') THEN
        ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Ajouter updatedAt si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='updatedAt') THEN
        ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Créer l'index sur email si il n'existe pas
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Créer le compte admin avec le mot de passe hashé (admin123)
-- Hash bcrypt généré pour "admin123"
INSERT INTO "User" ("id", "email", "password", "role", "isActive", "loginAttempts", "createdAt", "updatedAt")
VALUES (
    'admin-' || gen_random_uuid()::text,
    'contact@weevup.com',
    '$2a$10$F13nH3kL0R3Ye9ZR.5KhMOC50LDo82eGmsKLm7xCphkizCm9df0qa',
    'ADMIN',
    true,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- Vérification
SELECT 'Synchronisation terminée!' as message;
SELECT COUNT(*) as total_users, COUNT(*) FILTER (WHERE role = 'ADMIN') as admin_users FROM "User";
