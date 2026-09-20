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

- `web/` — app React + Vite + Tailwind (vues "Aujourd'hui", "Semaine", "Stats")
- `worker/` — Cloudflare Worker, seul point qui détient le token Notion
  côté serveur (jamais exposé au navigateur)
- `electron/` — enveloppe Windows (`.exe`) autour du même `web/`, voir son
  propre README
- `.github/workflows/deploy.yml` — build + déploiement automatique sur
  GitHub Pages à chaque push sur `web/`

## Déploiement du Worker

```
cd worker
npx wrangler login
npx wrangler kv namespace create RATE_LIMIT   # copier l'id renvoyé dans wrangler.toml
npx wrangler deploy
npx wrangler secret put NOTION_TOKEN
npx wrangler secret put API_KEY
```

## Sécurité (résumé, ~7/10 pour un outil perso)

- **Clé jamais dans le code livré** : demandée une fois à l'ouverture (`KeyGate.jsx`), stockée uniquement dans le `localStorage` du navigateur qui l'a saisie. Une réponse 401 efface la clé locale et redemande la saisie.
- **Clé à 192 bits d'entropie** (générée avec `crypto.randomBytes(24)`) — non devinable par force brute.
- **Rate limiting par IP** côté Worker (`RATE_LIMIT` en KV, fenêtre glissante de 60 requêtes/minute) — limite les abus si la clé fuit quand même. Fail-open si KV a un souci (dispo > blocage strict pour un outil perso).
- **CORS restreint** à l'origine GitHub Pages (`https://vk-3003.github.io`) plutôt qu'ouvert à `*`.
- **Séparation des repos** : ce repo (public, requis par Pages gratuit) ne contient aucune donnée perso ; `routine-bot` (privé) garde l'historique et les notes.

Limites connues, acceptées pour ce niveau de risque (pas de rotation automatique de clé, pas de vrai système de login/session) — voir la doc du repo `routine-bot` pour le détail des arbitrages.

## Secrets GitHub nécessaires (Settings → Secrets and variables → Actions)

- `VITE_WORKER_URL` — l'URL du Worker déployé

**Pas de `VITE_API_KEY` ici** : la clé n'est jamais dans le build. Elle
est demandée à l'ouverture de la page et stockée uniquement dans le
`localStorage` du navigateur qui l'a saisie — invisible dans le code
source, dans le repo, ou dans les outils dev d'un visiteur qui ne l'a
jamais entrée.

Le repo `routine-bot` (privé) contient la documentation complète du
projet et son historique de décisions.
