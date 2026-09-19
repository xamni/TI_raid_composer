import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing share id");
  }

  const { data, error } = await supabase
    .from("raid_shares")
    .select("id, preview_url")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).send("Share not found");
  }

  try {
    const indexPath = path.join(process.cwd(), "dist", "index.html");
    let html = fs.readFileSync(indexPath, "utf8");

    const metaTags = `
      <meta property="og:title" content="Totale Impro - Raid Composition">
      <meta property="og:description" content="Composition de raid partagée">
      <meta property="og:type" content="website">
      <meta property="og:image" content="${data.preview_url}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:image" content="${data.preview_url}">
    `;

    html = html.replace("</head>", `${metaTags}</head>`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Erreur chargement index.html :", error);
    return res.status(500).send("Unable to load app");
  }
}