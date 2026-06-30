export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(400).json({ error: "Missing x-api-key header" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt in body" });

  const payload = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  try {
    const r1 = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: payload
    });
    const d1 = await r1.json();
    if (r1.ok && !d1.error) return res.status(200).json(d1);
    var bearerError = d1;
  } catch (e) {
    var bearerError = { error: { message: e.message } };
  }

  try {
    const r2 = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload
    });
    const d2 = await r2.json();
    if (r2.ok && !d2.error) return res.status(200).json(d2);
    return res.status(400).json({ error: { message: "Both auth methods failed", bearer_attempt: bearerError, querykey_attempt: d2 } });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message, bearer_attempt: bearerError } });
  }
}
