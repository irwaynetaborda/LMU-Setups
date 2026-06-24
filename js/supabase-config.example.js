// ============================================================
//  LMU SETUPS — supabase-config.js (Exemplo)
//  Credenciais e inicialização do cliente Supabase
// ============================================================

// IMPORTANTE: Copie este arquivo como "supabase-config.js" no mesmo diretório
// e insira abaixo a URL e a Anon Key do seu projeto Supabase.
const SUPABASE_URL = "INSIRA_SUA_URL_AQUI";
const SUPABASE_ANON_KEY = "INSIRA_SUA_ANON_KEY_AQUI";

let supabaseClient = null;

if (SUPABASE_URL !== "INSIRA_SUA_URL_AQUI" && SUPABASE_ANON_KEY !== "INSIRA_SUA_ANON_KEY_AQUI") {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    });
  } catch (e) {
    console.error("[Supabase] Falha ao inicializar o cliente Supabase:", e);
  }
} else {
  console.warn("[Supabase] Credenciais não configuradas em js/supabase-config.js. O sistema funcionará localmente (localStorage) como fallback.");
}
