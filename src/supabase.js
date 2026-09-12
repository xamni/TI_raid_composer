import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://crzpvutlqzipcgtlmeqa.supabase.co";
const supabaseAnonKey = "sb_publishable_VKK5nRtnCrdTr6-GjDO1gg_fIX8JSG3";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);