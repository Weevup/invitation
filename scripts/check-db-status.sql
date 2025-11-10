-- Script pour vérifier l'état de la base de données Neon
-- Exécutez ce script avec: psql 'postgresql://...' -f scripts/check-db-status.sql

-- Afficher toutes les tables
\dt

-- Vérifier si la table _prisma_migrations existe
SELECT COUNT(*) as "Nombre de migrations appliquées"
FROM "_prisma_migrations";

-- Afficher les migrations appliquées
SELECT migration_name, started_at, finished_at
FROM "_prisma_migrations"
ORDER BY started_at DESC;

-- Compter les enregistrements dans les tables principales
SELECT
  (SELECT COUNT(*) FROM "User") as "Users",
  (SELECT COUNT(*) FROM "Event") as "Events",
  (SELECT COUNT(*) FROM "Guest") as "Guests",
  (SELECT COUNT(*) FROM "RSVP") as "RSVPs",
  (SELECT COUNT(*) FROM "EmailLog") as "EmailLogs",
  (SELECT COUNT(*) FROM "EmailTemplate") as "EmailTemplates",
  (SELECT COUNT(*) FROM "EmailIntegration") as "EmailIntegrations";
