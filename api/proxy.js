export default async (req, res) => {
  if (req.method === "GET") return res.status(200).send("proxy online");

  const raw = await req.text();
  console.log("RAW BODY:", raw);                     // ← see this in Logs
  let body;
  try { body = JSON.parse(raw); } catch { return res.status(400).send("Invalid JSON"); }
  const { target, options } = body || {};

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
    return res.status(r.status).json(await r.json());
  }

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
    return res.status(r.status).json(await r.json());
  }

  return res.status(400).send("unknown target");
};
