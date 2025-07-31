import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY = import.meta.env.VITE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

export default supabase;
