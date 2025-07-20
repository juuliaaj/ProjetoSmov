const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

module.exports = supabase;
