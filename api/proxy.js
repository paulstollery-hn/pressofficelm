// /api/proxy.js  – minimal proxy for GitHub & Supabase
export default async (req, res) => {
  // Simple GET = health-check
  if (req.method === "GET") {
    return res.status(200).send("proxy online");
  }

  // POST body should contain { target: "github"|"supabase", options: {...} }
  let body;
  try {
    body = await req.json();
  } catch {
    return res.status(400).send("Invalid JSON body");
  }
  const { target, options } = body;

  if (target === "github") {
    const r = await fetch(`https://api.github.com${options.path}`, {
      method: options.method,
      headers: {
        Authorization: `token ${process.env.GITHUB_PAT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(options.body)
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
