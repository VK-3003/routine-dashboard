// Cloudflare Worker: the only piece of the project allowed to write to Notion
// from the dashboard. Holds NOTION_TOKEN server-side, never exposed to the browser.
// Routes: GET /api/routines, GET /api/checkins?date=, POST /api/reschedule, POST /api/checkin.
// Protected by a shared API key (X-Api-Key header, entered once client-side and
// kept only in the visitor's localStorage - never shipped in the built JS) plus
// a per-IP rate limit backed by KV. Reasonable for a single-user personal tool,
// not enterprise-grade auth.

const NOTION_VERSION = "2022-06-28";
const ROUTINES_DB_ID = "5e91ce77595444dbbc35a4ca68310587";
const SUIVI_ROUTINES_DB_ID = "56ed3a43b14745f0af30afea117c962f";
const SUIVI_DB_ID = "27858c6c14fb4ec1845dd9b5cf94d534";
const STATS_WINDOW_DAYS = 30;
const ALLOWED_ORIGIN = "https://vk-3003.github.io";
const RATE_LIMIT_PER_MINUTE = 60;

function withCors(response) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
  return response;
}

function json(data, status = 200) {
  return withCors(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function notionHeaders(env) {
  return {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function isAuthorized(request, env) {
  return request.headers.get("X-Api-Key") === env.API_KEY;
}

// Fixed-window per-IP counter in KV. Fails open (allows the request) if KV
// itself errors out - rate limiting is defense-in-depth, not the primary
// safeguard, so an infra hiccup shouldn't lock the real user out.
async function isRateLimited(request, env) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const minuteBucket = Math.floor(Date.now() / 60000);
    const key = `rl:${ip}:${minuteBucket}`;

    const current = parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
    if (current >= RATE_LIMIT_PER_MINUTE) return true;

    await env.RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 90 });
    return false;
  } catch {
    return false;
  }
}

function richText(text) {
  return text ? [{ text: { content: text } }] : [];
}

function plainText(prop) {
  return prop?.rich_text?.[0]?.plain_text ?? null;
}

async function handleRoutines(env) {
  const res = await fetch(`https://api.notion.com/v1/databases/${ROUTINES_DB_ID}/query`, {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify({
      filter: { property: "Actif", checkbox: { equals: true } },
      page_size: 100,
    }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data }, res.status);

  const routines = data.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      nom: p.Nom?.title?.[0]?.plain_text ?? "(sans nom)",
      domaine: p.Domaine?.select?.name ?? null,
      moment: p.Moment?.select?.name ?? null,
      frequence: p["Fréquence"]?.select?.name ?? null,
      heure: plainText(p.Heure),
      jours: (p.Jours?.multi_select ?? []).map((o) => o.name),
      duree: p["Durée (min)"]?.number ?? null,
      alarme: p.Alarme?.checkbox ?? false,
    };
  });
  return json({ routines });
}

async function handleReschedule(request, env) {
  const body = await request.json();
  if (!body.routine_id) return json({ error: "routine_id manquant" }, 400);

  const properties = {};
  if (body.heure !== undefined) properties.Heure = { rich_text: richText(body.heure) };
  if (body.jours !== undefined) {
    properties.Jours = { multi_select: body.jours.map((name) => ({ name })) };
  }
  if (body.moment !== undefined) {
    properties.Moment = body.moment ? { select: { name: body.moment } } : { select: null };
  }

  const res = await fetch(`https://api.notion.com/v1/pages/${body.routine_id}`, {
    method: "PATCH",
    headers: notionHeaders(env),
    body: JSON.stringify({ properties }),
  });
  const data = await res.json();
  return json(data, res.status);
}

async function handleCheckinsForDate(request, env) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!date) return json({ error: "date manquante" }, 400);

  const res = await fetch(`https://api.notion.com/v1/databases/${SUIVI_ROUTINES_DB_ID}/query`, {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify({
      filter: { property: "Date", date: { equals: date } },
      page_size: 100,
    }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data }, res.status);

  const checkins = data.results
    .filter((page) => page.properties.Routine?.relation?.length)
    .map((page) => ({
      routine_id: page.properties.Routine.relation[0].id,
      fait: page.properties.Fait?.checkbox ?? false,
    }));
  return json({ checkins });
}

async function handleCheckin(request, env) {
  const body = await request.json();
  if (!body.routine_id || !body.date) return json({ error: "routine_id/date manquant" }, 400);

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: { database_id: SUIVI_ROUTINES_DB_ID },
      properties: {
        Entrée: { title: richText(`${body.date} - ${body.routine_id.slice(0, 8)}`) },
        Date: { date: { start: body.date } },
        Routine: { relation: [{ id: body.routine_id }] },
        Fait: { checkbox: !!body.fait },
      },
    }),
  });
  const data = await res.json();
  return json(data, res.status);
}

async function queryAllPages(databaseId, filter, env) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: notionHeaders(env),
      body: JSON.stringify({ filter, page_size: 100, start_cursor: cursor }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

function isoDaysAgo(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function completionRatio(entries) {
  if (!entries.length) return null;
  const done = entries.filter((e) => e.fait).length;
  return done / entries.length;
}

/**
 * Aggregates Suivi routines + Suivi quotidien into stats, computed on demand
 * (not a static file) so no personal data ever needs to live in the public
 * repo - the same privacy boundary as every other route here.
 */
async function handleStats(env) {
  const today = new Date();
  const startStr = isoDaysAgo(today, STATS_WINDOW_DAYS);
  const dateFilter = { property: "Date", date: { on_or_after: startStr } };

  let checkinPages, metricPages, routinePages;
  try {
    [checkinPages, metricPages, routinePages] = await Promise.all([
      queryAllPages(SUIVI_ROUTINES_DB_ID, dateFilter, env),
      queryAllPages(SUIVI_DB_ID, dateFilter, env),
      // No Actif filter: a routine paused after being tracked should keep
      // its name in historical stats instead of showing up as "(inconnue)".
      queryAllPages(ROUTINES_DB_ID, undefined, env),
    ]);
  } catch (error) {
    return json({ error }, 502);
  }

  const namesById = {};
  const domaineById = {};
  for (const page of routinePages) {
    const p = page.properties;
    namesById[page.id] = p.Nom?.title?.[0]?.plain_text ?? "(sans nom)";
    domaineById[page.id] = p.Domaine?.select?.name ?? null;
  }

  const byRoutine = {};
  for (const page of checkinPages) {
    const rel = page.properties.Routine?.relation;
    const date = page.properties.Date?.date?.start;
    if (!rel?.length || !date) continue;
    const routineId = rel[0].id;
    const fait = page.properties.Fait?.checkbox ?? false;
    (byRoutine[routineId] ??= {})[date] = fait;
  }

  const todayStr = today.toISOString().slice(0, 10);
  const last7Start = isoDaysAgo(today, 7);

  const routines = Object.entries(byRoutine).map(([routineId, byDate]) => {
    const entries = Object.entries(byDate)
      .map(([date, fait]) => ({ date, fait }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let streak = 0;
    const cursor = new Date(today);
    if (!(todayStr in byDate)) cursor.setDate(cursor.getDate() - 1);
    for (;;) {
      const d = cursor.toISOString().slice(0, 10);
      if (byDate[d] !== true) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      id: routineId,
      nom: namesById[routineId] ?? "(inconnue)",
      domaine: domaineById[routineId] ?? null,
      completion_7d: completionRatio(entries.filter((e) => e.date >= last7Start)),
      completion_30d: completionRatio(entries),
      streak,
      entries,
    };
  });

  const metrics = metricPages
    .map((page) => {
      const p = page.properties;
      return {
        date: p.Date?.date?.start,
        sommeil: p["Sommeil (h)"]?.number ?? null,
        energie: p["Énergie"]?.number ?? null,
        stress: p["Stress"]?.number ?? null,
      };
    })
    .filter((m) => m.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  return json({ routines, metrics });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));
    if (!isAuthorized(request, env)) return json({ error: "unauthorized" }, 401);
    if (await isRateLimited(request, env)) return json({ error: "rate limited" }, 429);

    const url = new URL(request.url);
    if (url.pathname === "/api/routines" && request.method === "GET") return handleRoutines(env);
    if (url.pathname === "/api/checkins" && request.method === "GET") return handleCheckinsForDate(request, env);
    if (url.pathname === "/api/stats" && request.method === "GET") return handleStats(env);
    if (url.pathname === "/api/reschedule" && request.method === "POST") return handleReschedule(request, env);
    if (url.pathname === "/api/checkin" && request.method === "POST") return handleCheckin(request, env);

    return json({ error: "not found" }, 404);
  },
};
