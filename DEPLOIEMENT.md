# Boîtier Code ATLAS — Déploiement

Application web installable (PWA), sans build, 100% fichiers statiques.

## Option A — Héberger sur ta page GitHub existante (recommandé)

Tu as déjà `didiergoralski-dotcom.github.io/atlas---ressources/`. Tu peux ajouter
le boîtier dans un sous-dossier du même dépôt :

1. Crée un dossier `boitier-code/` à la racine du dépôt `atlas---ressources`
2. Copie dedans les fichiers : `index.html`, `app.js`, `manifest.json`,
   `service-worker.js`, et le dossier `icons/`
3. Depuis un PC (comme pour l'upload de `index.html` déjà en attente), fais un
   commit + push sur GitHub, ou upload direct via l'interface web GitHub
   ("Add file" → "Upload files")
4. L'appli sera accessible à :
   `https://didiergoralski-dotcom.github.io/atlas---ressources/boitier-code/`

## Option B — Nouveau dépôt dédié

1. Crée un dépôt GitHub `atlas-boitier-code` (public)
2. Upload tous les fichiers de ce dossier à la racine
3. Dans **Settings → Pages**, source = branche `main`, dossier `/ (root)`
4. L'appli sera accessible à :
   `https://<ton-compte-github>.github.io/atlas-boitier-code/`

## Installation par les candidats

- **Android (Chrome)** : ouvrir le lien → bandeau "Installer" en bas
  (ou menu ⋮ → "Ajouter à l'écran d'accueil")
- **iPhone (Safari)** : ouvrir le lien → bouton Partager (carré + flèche) →
  "Sur l'écran d'accueil"

Une fois installée, l'icône ATLAS apparaît comme une vraie appli, en plein
écran, et fonctionne même sans connexion (grâce au `service-worker.js`).

## Notes techniques

- Aucune dépendance externe à part la police Google Fonts (Barlow Condensed +
  Inter), chargée en ligne — l'appli fonctionne quand même hors-ligne avec la
  police de secours si la connexion n'est pas disponible au premier chargement.
- Les données (série en cours, réglages) sont stockées localement dans le
  navigateur de chaque téléphone (`localStorage`), pas de serveur, pas de
  compte à créer.
- Pour changer le nombre de questions par défaut, la police, ou les couleurs,
  tout est modifiable directement dans `index.html` (variables CSS en haut du
  fichier) et `app.js`.
