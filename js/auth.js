// ============================================================
//  LMU SETUPS — auth.js
//  Módulo central de autenticação (Provisório / Hardcoded)
// ============================================================

const Auth = {
  // Configuração atual do usuário de teste
  testUser: 'Irwayne',
  testPass: '123456',

  // Verifica as credenciais e salva no localStorage
  login(username, password) {
    if (username === this.testUser && password === this.testPass) {
      localStorage.setItem('lmu_auth', 'true');
      return true;
    }
    return false;
  },

  // Remove a sessão e redireciona
  logout() {
    localStorage.removeItem('lmu_auth');
    window.location.href = 'login.html';
  },

  // Retorna se o usuário está logado
  isAuthenticated() {
    return localStorage.getItem('lmu_auth') === 'true';
  },

  // Protege a página (chamado no <head>)
  requireAuth() {
    // Evita loop infinito se já estiver na tela de login
    if (!this.isAuthenticated() && !window.location.pathname.endsWith('login.html')) {
      window.location.replace('login.html');
    }
  }
};

// Automagicamente exibe/esconde elementos baseados no login
document.addEventListener('DOMContentLoaded', () => {
  const isAuth = Auth.isAuthenticated();
  document.querySelectorAll('.auth-only').forEach(el => {
    el.style.display = isAuth ? '' : 'none';
  });
  document.querySelectorAll('.unauth-only').forEach(el => {
    el.style.display = isAuth ? 'none' : '';
  });
});
