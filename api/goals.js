export default async function handler(req, res) {
  const headers = {
    "Content-Type": "application/json",
    "X-Master-Key": "$2a$10$LfpSWnHyxka5Db1sdFyCZuIJvzxxSiFUNTWhFBGC0615h//REHCZy"
  };

  const binId = "687630a7bb9a9d26e899fdea";

  const url = `https://api.jsonbin.io/v3/b/${binId}${req.method === "GET" ? "/latest" : ""}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === "GET" ? undefined : JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data.record || data);
  } catch (error) {
    res.status(500).json({ error: "Errore nella chiamata a JSONBin", detail: error.toString() });
  }
}

