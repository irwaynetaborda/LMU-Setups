const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("AVISO: SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas nas variáveis de ambiente do Vercel.");
  console.log("Usando placeholders padrão ou mantendo arquivo existente.");
}

const templatePath = path.join(__dirname, 'js', 'supabase-config.example.js');
const outputPath = path.join(__dirname, 'js', 'supabase-config.js');

if (fs.existsSync(templatePath)) {
  let content = fs.readFileSync(templatePath, 'utf8');
  
  if (url) {
    content = content.replace(/"INSIRA_SUA_URL_AQUI"/g, `"${url}"`);
  }
  if (key) {
    content = content.replace(/"INSIRA_SUA_ANON_KEY_AQUI"/g, `"${key}"`);
  }
  
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log("Arquivo js/supabase-config.js gerado com sucesso a partir do modelo de variáveis de ambiente!");
} else {
  console.error("Erro: arquivo js/supabase-config.example.js não encontrado!");
  process.exit(1);
}
