// /api/proxy.js  – minimal proxy for GitHub & Supabase (tolerant JSON parser)

export default async (req, res) => {
  // Health-check
  if (req.method === "GET") {
    return res.status(200).send("proxy online");
  }

  // Parse body (handles raw text → JSON)
  const raw = await req.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return res.status(400).send("Invalid JSON");
  }
  const { target, options } = body || {};

  // ---------- GitHub ----------
  if (target === "github") {
    const r = await fetch(`https://api.github.com${options.path}`, {
      method: options.method,
      headers: {
        Authorization: `token ${process.env.GITHUB_PAT}`,
        "Content-Type": "application/json",
        "User-Agent": "pressofficelm-proxy"
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  // ---------- Supabase ----------
  if (target === "supabase") {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options)
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  // Unknown target
  return res.status(400).send("unknown target");
};
