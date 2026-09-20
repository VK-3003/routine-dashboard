# Routine Desktop (Electron)

Enveloppe Windows autour du dashboard web (`../web/`). Charge le même
code, buildé avec des chemins relatifs (`file://` au lieu de
`https://vk-3003.github.io/...`).

## Build complet (web + app)

```
cd ../web
npm install
VITE_BASE=./ VITE_WORKER_URL=https://routine-bot-api.lamarque-victor94.workers.dev npm run build
cd ../electron
rm -rf web-dist && cp -r ../web/dist web-dist
npm install
```

## Lancer en dev

```
npm start
```

## Générer l'installeur Windows (.exe)

```
npm run dist
```

Produit `release/Routine Setup <version>.exe` (NSIS, non signé — normal
pour un usage perso, Windows affichera un avertissement SmartScreen la
première fois, "Informations complémentaires" → "Exécuter quand même").

**Prérequis Windows** : le mode développeur doit être activé (Paramètres
→ Confidentialité et sécurité → Pour les développeurs), sinon
`electron-builder` échoue en tentant de créer des liens symboliques
pour un paquet de signature de code (`winCodeSign`) qu'on n'utilise
même pas.

## Mettre à jour l'app après un changement du dashboard

Refaire les 4 étapes de "Build complet" ci-dessus, puis `npm run dist`.
Pas d'automatisation CI pour l'instant — build manuel à la demande.
