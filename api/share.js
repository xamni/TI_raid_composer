import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
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

  return res.status(200).json(data);
}