// ============================================================
//  LMU SETUPS — supabase-config.js
//  Credenciais e inicialização do cliente Supabase
// ============================================================

// IMPORTANTE: Insira abaixo a URL e a Anon Key do seu projeto Supabase.
// Você pode obter esses dados nas configurações de API do seu painel do Supabase.
const SUPABASE_URL = "https://onfghiehtyswvhwpcwct.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZmdoaWVodHlzd3Zod3Bjd2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0OTksImV4cCI6MjA5NzI3MjQ5OX0.3zmG-hXZq2fJsg-N04JhzbV3dn0PjNDrPEHjOWoejUE";

let supabaseClient = null;

if (SUPABASE_URL !== "INSIRA_SUA_URL_AQUI" && SUPABASE_ANON_KEY !== "INSIRA_SUA_ANON_KEY_AQUI") {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("[Supabase] Falha ao inicializar o cliente Supabase:", e);
  }
} else {
  console.warn("[Supabase] Credenciais não configuradas em js/supabase-config.js. O sistema funcionará localmente (localStorage) como fallback.");
}
