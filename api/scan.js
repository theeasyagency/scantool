export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { businessName, website, city, email } = req.body;

    if (!website) {
      return res.status(400).json({ error: "Website is required" });
    }

    // 👉 Normalizza URL
    let url = website;
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    // 👉 Fetch HTML sito
    const response = await fetch(url);
    const html = await response.text();

    // 👉 Controlli base
    const hasTitle = html.includes("<title>");
    const hasMeta = html.includes('name="description"');
    const hasH1 = html.includes("<h1");

    // 👉 Score semplice
    let score = 0;
    if (hasTitle) score += 20;
    if (hasMeta) score += 20;
    if (hasH1) score += 20;

    // 👉 Risultato
    const result = {
      score,
      checks: {
        title: hasTitle,
        meta: hasMeta,
        h1: hasH1,
      },
      tips: generateTips({ hasTitle, hasMeta, hasH1 }),
    };

    console.log("LEAD:", { businessName, email, website, city });

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Errore analisi sito" });
  }
}

// Suggerimenti
function generateTips(seo) {
  const tips = [];

  if (!seo.hasTitle) {
    tips.push("Manca il tag title: fondamentale per Google.");
  }

  if (!seo.hasMeta) {
    tips.push("Manca la meta description.");
  }

  if (!seo.hasH1) {
    tips.push("Non c'è un H1 chiaro nella pagina.");
  }

  return tips;
}