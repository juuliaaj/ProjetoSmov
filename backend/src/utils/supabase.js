const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SERVICE_KEY;

console.log("Supabase URL:", SUPABASE_URL);
console.log("Service Key:", SERVICE_KEY ? "Loaded" : "Not Loaded");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

module.exports = supabase;
