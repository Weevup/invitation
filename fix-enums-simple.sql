-- Recréer l'enum EmailType avec toutes les valeurs
-- ATTENTION : Cela nécessite que les tables qui utilisent cet enum soient vides

-- Vérifier les valeurs actuelles de l'enum
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'EmailType'::regtype ORDER BY enumsortorder;

-- Si l'enum n'a pas toutes les valeurs, les ajouter :
-- Note: PostgreSQL ne permet pas IF NOT EXISTS avant version 9.1
-- Il faut les ajouter une par une et ignorer les erreurs

-- Alternative: Appliquer toutes les migrations Prisma
-- prisma migrate deploy
