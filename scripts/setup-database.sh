#!/bin/bash

# Script pour synchroniser la base de données Prisma
# Usage: ./scripts/setup-database.sh

set -e

echo "🔧 Configuration de la base de données Prisma"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL n'est pas défini"
  echo ""
  echo "Veuillez définir DATABASE_URL dans votre fichier .env"
  echo "ou en tant que variable d'environnement:"
  echo ""
  echo "  export DATABASE_URL='postgresql://user:password@host/database'"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL trouvé"
echo ""

# Étape 1: Générer le client Prisma
echo "📦 Étape 1/3: Génération du client Prisma..."
npx prisma generate
echo "✅ Client Prisma généré"
echo ""

# Étape 2: Pousser le schéma vers la base de données
echo "🚀 Étape 2/3: Synchronisation du schéma avec la base de données..."
npx prisma db push --skip-generate
echo "✅ Schéma synchronisé"
echo ""

# Étape 3: Optionnel - Charger les données de seed
read -p "Voulez-vous charger les données de démonstration? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Étape 3/3: Chargement des données de seed..."
  npm run db:seed:weevup
  echo "✅ Données chargées"
else
  echo "⏭️  Étape 3/3: Chargement des données ignoré"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Configuration terminée avec succès!"
echo ""
echo "Vous pouvez maintenant:"
echo "  - Accéder à l'application en local: npm run dev"
echo "  - Voir la base de données: npx prisma studio"
echo ""
