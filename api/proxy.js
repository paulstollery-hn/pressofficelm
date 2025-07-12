// /api/proxy.js  – minimal proxy for GitHub & Supabase
export default async (req, res) => {
  const { target, options } = await req.json();      // options differ per target
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
  res.status(400).end("unknown target");
};
