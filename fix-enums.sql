-- Script pour ajouter les valeurs manquantes aux enums si elles n'existent pas

-- Vérifier et ajouter SAVE_THE_DATE à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SAVE_THE_DATE' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'SAVE_THE_DATE';
    END IF;
END $$;

-- Vérifier et ajouter INVITE à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INVITE' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'INVITE';
    END IF;
END $$;

-- Vérifier et ajouter INVITATION à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INVITATION' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'INVITATION';
    END IF;
END $$;

-- Vérifier et ajouter REMINDER à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REMINDER' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'REMINDER';
    END IF;
END $$;

-- Vérifier et ajouter CONFIRMATION à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONFIRMATION' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'CONFIRMATION';
    END IF;
END $$;

-- Vérifier et ajouter INFO à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INFO' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'INFO';
    END IF;
END $$;

-- Vérifier et ajouter CUSTOM à EmailType si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CUSTOM' AND enumtypid = 'EmailType'::regtype) THEN
        ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'CUSTOM';
    END IF;
END $$;
