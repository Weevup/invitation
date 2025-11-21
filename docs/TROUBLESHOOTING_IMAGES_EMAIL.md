# Dépannage : Images manquantes dans les emails

## Problème
Vous avez envoyé une invitation mais les images n'apparaissent pas dans l'email reçu.

## Causes possibles

### 1. **Template non sauvegardé**
- Vous avez ajouté des images mais oublié de cliquer sur "Sauvegarder"
- **Solution** : Retournez à l'éditeur et sauvegardez le template

### 2. **Images trop volumineuses**
- Les images en base64 de plus de 1-2MB peuvent ne pas s'afficher dans certains clients email
- **Solution** : Compressez vos images avant de les uploader (recommandé : max 500KB par image)

### 3. **URLs relatives** (maintenant corrigé automatiquement)
- Les images avec des chemins relatifs ne fonctionnent pas dans les emails
- **Solution** : Le système convertit automatiquement les URLs relatives en URLs absolues

## Comment diagnostiquer

### Outil de diagnostic intégré
Visitez la page de diagnostic de votre template :
```
/admin/templates/[TEMPLATE_ID]/diagnostic
```

Ou via l'API :
```bash
GET /api/admin/templates/[TEMPLATE_ID]/debug
```

### Que vérifie le diagnostic ?
- ✅ Nombre d'images dans le template
- ✅ Type d'URL (base64, absolue, relative)
- ✅ Taille de chaque image
- ✅ Compatibilité avec les clients email
- ⚠️ Avertissements pour images trop volumineuses

## Solutions

### Solution 1 : Compresser vos images
Avant d'uploader une image :
1. Utilisez un outil de compression (TinyPNG, Squoosh, etc.)
2. Cible : **max 500KB** par image
3. Format recommandé : JPEG pour photos, PNG pour logos

### Solution 2 : Vérifier le template
1. Ouvrez l'éditeur d'email
2. Vérifiez que toutes les images sont bien affichées dans l'aperçu
3. **Sauvegardez** le template
4. Envoyez un email de test à vous-même

### Solution 3 : Utiliser le mode de test
Avant d'envoyer massivement :
1. Allez dans Hub Email → Email de test
2. Entrez votre adresse email
3. Envoyez un test
4. Vérifiez que les images s'affichent

### Solution 4 : Vérifier le client email
Certains clients email ont des restrictions :
- **Outlook** : Limite parfois les data URLs très longs
- **Gmail** : Peut bloquer les images par défaut (demande confirmation)
- **Apple Mail** : Généralement compatible

## Modifications automatiques (nouveau)

Le système applique maintenant automatiquement ces corrections :

### ✅ Conversion d'URLs
```html
<!-- AVANT -->
<img src="/uploads/image.jpg">

<!-- APRÈS (automatique) -->
<img src="https://votre-domaine.com/uploads/image.jpg">
```

### ✅ Validation des images
- Les images sont validées avant l'envoi
- Les avertissements sont loggés pour le débogage
- Les URLs relatives sont converties en URLs absolues

## Limites des clients email

| Client | Limite data URL | Recommandation |
|--------|----------------|----------------|
| Gmail | ~2MB | Compresser à 500KB |
| Outlook | ~1MB | Compresser à 500KB |
| Apple Mail | ~5MB | Compresser à 1MB |
| Thunderbird | ~2MB | Compresser à 500KB |

## Checklist de vérification

Avant d'envoyer une campagne email :

- [ ] J'ai compressé mes images (max 500KB chacune)
- [ ] J'ai sauvegardé le template après ajout des images
- [ ] J'ai envoyé un email de test à moi-même
- [ ] J'ai vérifié l'email de test dans mon client (Gmail/Outlook)
- [ ] Les images s'affichent correctement dans l'email de test
- [ ] J'ai consulté la page de diagnostic si des problèmes persistent

## Besoin d'aide ?

Si les images ne s'affichent toujours pas après avoir suivi ces étapes :

1. Visitez `/admin/templates/[TEMPLATE_ID]/diagnostic`
2. Prenez une capture d'écran des erreurs
3. Vérifiez les logs serveur pour les avertissements
4. Contactez le support avec les détails

## Améliorations futures

Prochaines fonctionnalités prévues :
- Upload d'images sur CDN externe
- Compression automatique des images
- Conversion automatique WebP → JPEG pour compatibilité
- Aperçu multi-clients (Gmail, Outlook, Apple Mail)
