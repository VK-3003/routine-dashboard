# Routine Dashboard

Code de l'application (dashboard + Planning) pour le projet de suivi de
routines. Volontairement dans un repo **public** séparé, distinct du
repo privé `routine-bot` (bot Telegram, historique, notes perso) — ce
repo ne contient que du code générique, jamais de données personnelles.
GitHub Pages gratuit exige un repo public ; les vraies données de
routines ne transitent jamais par ce repo, seulement via des appels
en direct au Worker au moment où le dashboard est ouvert dans un
navigateur.

## Structure

- `web/` — app React + Vite + Tailwind (vues "Aujourd'hui" et "Semaine")
- `worker/` — Cloudflare Worker, seul point qui détient le token Notion
  côté serveur (jamais exposé au navigateur)
- `.github/workflows/deploy.yml` — build + déploiement automatique sur
  GitHub Pages à chaque push sur `web/`

## Déploiement du Worker

```
cd worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put NOTION_TOKEN
npx wrangler secret put API_KEY
```

## Secrets GitHub nécessaires (Settings → Secrets and variables → Actions)

- `VITE_WORKER_URL` — l'URL du Worker déployé

**Pas de `VITE_API_KEY` ici** : la clé n'est jamais dans le build. Elle
est demandée à l'ouverture de la page et stockée uniquement dans le
`localStorage` du navigateur qui l'a saisie — invisible dans le code
source, dans le repo, ou dans les outils dev d'un visiteur qui ne l'a
jamais entrée.

Le repo `routine-bot` (privé) contient la documentation complète du
projet et son historique de décisions.
