#!/usr/bin/env node

/**
 * Script de vérification de configuration avant déploiement
 * Exécutez: node scripts/verify-setup.js
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_APP_URL'
];

console.log('🔍 Vérification de la configuration...\n');

let hasErrors = false;

// Vérifier les variables d'environnement
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];

  if (!value) {
    console.error(`❌ ${varName} est manquante`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} est définie`);

    // Vérifications spécifiques
    if (varName.includes('URL') && !varName.includes('DATABASE')) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        console.error(`   ⚠️  ${varName} doit commencer par https:// (valeur: ${value})`);
        hasErrors = true;
      }
    }

    if (varName === 'AUTH_SECRET' && value.length < 32) {
      console.error(`   ⚠️  ${varName} devrait avoir au moins 32 caractères`);
      hasErrors = true;
    }
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Configuration incorrecte. Consultez VERCEL-ENV-CHECKLIST.md\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration correcte!\n');
  process.exit(0);
}
