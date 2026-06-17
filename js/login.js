// ============================================================
//  LMU SETUPS — login.js
//  Lógica da tela de login
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = document.getElementById('l-user').value.trim();
    const pass = document.getElementById('l-pass').value.trim();
    
    if (!user || !pass) {
      errorMsg.textContent = 'Preencha usuário e senha.';
      errorMsg.style.display = 'block';
      return;
    }

    btn.textContent = 'Autenticando...';
    btn.disabled = true;
    
    // Simula um pequeno delay para feedback visual
    setTimeout(() => {
      const success = Auth.login(user, pass);
      
      if (success) {
        window.location.href = 'index.html';
      } else {
        errorMsg.textContent = 'Usuário ou senha incorretos.';
        errorMsg.style.display = 'block';
        btn.textContent = 'Entrar';
        btn.disabled = false;
      }
    }, 400);
  });
});
