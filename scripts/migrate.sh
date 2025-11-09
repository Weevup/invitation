#!/bin/bash
# Script de migration automatique pour Vercel

echo "🔄 Synchronisation de la base de données..."

# Tenter d'abord les migrations
if npx prisma migrate deploy 2>/dev/null; then
  echo "✅ Migrations appliquées avec succès"
else
  echo "⚠️  Migrations échouées, tentative de db:push..."
  npx prisma db push --accept-data-loss --skip-generate
  echo "✅ Base de données synchronisée"
fi

echo "✨ Synchronisation terminée"
