# 🎫 Système de Badges - Guide d'Utilisation

**Version:** 1.0.0
**Date:** 15 novembre 2025

---

## 📋 Vue d'Ensemble

Le système de badges permet de générer et d'imprimer automatiquement des badges professionnels pour vos invités. Chaque badge inclut :
- Nom complet de l'invité
- Entreprise et fonction
- QR code pour le check-in
- Design personnalisable par événement

---

## 🚀 Démarrage Rapide

### 1. Accéder aux Badges

1. Connectez-vous à l'administration
2. Sélectionnez votre événement
3. Cliquez sur **"Badges"** dans le menu latéral

### 2. Générer des Badges

1. Allez dans l'onglet **"Générer"**
2. Sélectionnez les invités (doivent avoir un RSVP)
3. Cliquez sur **"Générer"**
4. Les badges sont créés automatiquement

### 3. Exporter en PDF

1. Dans l'onglet **"Vue d'ensemble"**
2. Sélectionnez les badges à imprimer
3. Cliquez sur **"Exporter"**
4. Le PDF est téléchargé automatiquement

---

## 🎨 Fonctionnalités

### Génération Automatique

✅ **QR Code** : Généré automatiquement pour chaque invité
✅ **Données dynamiques** : Prénom, nom, entreprise, fonction
✅ **Batch** : Générez jusqu'à 100+ badges à la fois
✅ **Mise à jour** : Re-générer un badge met à jour les données

### Export PDF

✅ **Qualité impression** : 300 DPI pour impression professionnelle
✅ **Multi-badges** : Plusieurs badges par page A4
✅ **Optimisé** : Découpe automatique optimisée
✅ **Tracking** : Compteur d'impressions par badge

### Statuts

| Statut | Description |
|--------|-------------|
| **Prêt** 🟢 | Badge généré et prêt à imprimer |
| **Imprimé** 🔵 | Badge a été exporté en PDF |
| **Distribué** 🟣 | Badge remis à l'invité |

---

## 📐 Tailles de Badges

### Standard (Défaut)
- **Dimensions:** 85.6mm × 54mm
- **Format:** Taille carte de crédit
- **Usage:** Badge de poche, porte-badge standard

### Large
- **Dimensions:** 100mm × 70mm
- **Format:** Légèrement plus grand
- **Usage:** Meilleure visibilité

### Lanyard
- **Dimensions:** 100mm × 150mm
- **Format:** Vertical
- **Usage:** Tour de cou (lanyard)

### A6
- **Dimensions:** 105mm × 148mm
- **Format:** Quart de A4
- **Usage:** Badge table, affichage

---

## 🎯 Workflow Recommandé

### Avant l'Événement

1. **J-30** : Configurer le design (optionnel)
2. **J-7** : Générer badges pour invités confirmés
3. **J-2** : Exporter et imprimer tous les badges
4. **J-1** : Vérifier la qualité d'impression

### Jour de l'Événement

1. **Arrivée** : Scanner QR code pour check-in
2. **Stand** : Remettre badge aux invités
3. **Suivi** : Marquer badges comme "Distribués"

### Après l'Événement

- Consultez les statistiques d'impression
- Vérifiez quels badges n'ont pas été distribués
- Analysez les données de check-in

---

## 🎨 Templates de Badges

### Corporate Standard (Défaut)

```
┌─────────────────────────────┐
│   [LOGO ENTREPRISE]         │
│                             │
│      JEAN DUPONT            │ ← Nom en gras
│   Directeur Marketing       │ ← Fonction
│   Acme Corporation          │ ← Entreprise
│                             │
│         [QR CODE]           │ ← Check-in
└─────────────────────────────┘
```

**Caractéristiques:**
- Fond blanc professionnel
- Bordure couleur événement
- QR code 80x80px
- Police Arial

### VIP

```
┌─────────────────────────────┐
│          ★ VIP ★            │
│                             │
│                             │
│      JEAN DUPONT            │ ← Nom doré
│   CEO • Acme Corp           │
│                             │
│         [QR CODE]           │
└─────────────────────────────┘
```

**Caractéristiques:**
- Fond noir élégant
- Bordure dorée
- Texte blanc/doré
- Police Georgia

### Simple Lanyard

```
┌───────────────┐
│               │
│  JEAN DUPONT  │
│               │
│  Acme Corp    │
│  Directeur    │
│               │
│   [QR CODE]   │
│               │
│  Événement    │
│  2025         │
└───────────────┘
```

**Caractéristiques:**
- Format vertical
- QR code large (400px)
- Nom événement en bas
- Optimal pour lanyard

---

## 🔧 Configuration Avancée

### Design Personnalisé

Le système utilise un design par défaut professionnel. Un **designer visuel** sera disponible prochainement pour personnaliser :

- Position des champs
- Couleurs et polices
- Logos personnalisés
- Sections header/body/footer
- Bordures et styles

### Paramètres d'Impression

**Badges par page:** 10 (défaut)
**Marge page:** 10mm
**Espacement:** 5mm

Ces paramètres sont optimisés pour une impression A4 standard.

---

## 📊 API Endpoints

### Générer des Badges

```typescript
POST /api/admin/events/[eventId]/badges/generate
Body: {
  guestIds: string[] // IDs des invités
}
Response: {
  created: number
  updated: number
  total: number
}
```

### Exporter en PDF

```typescript
GET /api/admin/events/[eventId]/badges/export?guestIds=id1,id2
Response: application/pdf
```

### Lister les Badges

```typescript
GET /api/admin/events/[eventId]/badges
Response: {
  badges: Badge[]
  stats: {
    total: number
    ready: number
    issued: number
    printed: number
  }
}
```

---

## 🐛 Dépannage

### Problème: "Aucun badge à exporter"

**Solution:** Générez d'abord les badges dans l'onglet "Générer"

### Problème: "Invité n'a pas de RSVP"

**Solution:** L'invité doit d'abord soumettre son RSVP avant de pouvoir générer un badge

### Problème: QR Code ne scanne pas

**Vérifications:**
- Qualité d'impression suffisante (300 DPI)
- QR code non rogné
- Scanner compatible avec URLs

### Problème: PDF vide ou erreur

**Solutions:**
- Vérifier que les badges sont "Prêts"
- Rafraîchir la page
- Essayer avec moins de badges (max 50)

---

## 💡 Bonnes Pratiques

### Impression

✅ **Qualité:** Utilisez une imprimante laser (meilleure que jet d'encre)
✅ **Papier:** Papier épais 200-300g/m² recommandé
✅ **Couleur:** Impression couleur pour meilleur rendu
✅ **Test:** Imprimez 1-2 badges de test avant le batch complet

### Gestion

✅ **Pré-génération:** Générez les badges 2-3 jours avant
✅ **Backup:** Conservez le PDF d'export
✅ **Tracking:** Cochez "Distribué" après remise
✅ **Réimpressions:** Système tracker automatiquement les réimpressions

### Sécurité

✅ **QR Codes:** Uniques et non falsifiables
✅ **Validation:** Check-in requis pour entrée
✅ **Expiration:** QR codes liés à l'événement

---

## 🔮 Fonctionnalités à Venir

### Phase 2 (À venir)

- [ ] **Designer visuel** drag & drop
- [ ] **Templates marketplace**
- [ ] **Upload logos** personnalisés
- [ ] **Photos invités** sur badges
- [ ] **NFC/RFID** support
- [ ] **Badge digital** (mobile wallet)

### Phase 3 (Futur)

- [ ] **Reconnaissance faciale** check-in
- [ ] **Badges intelligents** (LED, e-ink)
- [ ] **Gamification** (badges collectionnables)
- [ ] **Analytics avancés** (temps port du badge)

---

## 📞 Support

**Questions ?** Contactez l'équipe support :
- Email: support@weevup.com
- Documentation: https://docs.weevup.com
- Issues GitHub: https://github.com/Weevup/invitation/issues

---

## 📜 Licence

© 2025 Weevup. Tous droits réservés.

---

**Dernière mise à jour:** 15 novembre 2025
**Version documentation:** 1.0.0
