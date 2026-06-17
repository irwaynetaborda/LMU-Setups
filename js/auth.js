// ============================================================
//  LMU SETUPS — auth.js
//  Autenticação real via Supabase Auth
//  Modal de Login/Cadastro injetado dinamicamente no header
// ============================================================

const Auth = (() => {
  let _user = null;
  let _modalInjected = false;

  // ── Helpers internos ──────────────────────────────────────

  function _getInitials(email) {
    if (!email) return '?';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || email[0].toUpperCase();
  }

  function _showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-in`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-hide'), 3500);
    setTimeout(() => toast.remove(), 4000);
  }

  // ── Atualiza área do header ───────────────────────────────

  function _updateHeader() {
    const area = document.getElementById('header-auth-area');
    if (!area) return;

    if (_user) {
      const initials = _getInitials(_user.email);
      area.innerHTML = `
        <a href="add-setup.html" class="btn btn-primary" id="btn-new-setup">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
          Novo Setup
        </a>
        <div class="user-chip" id="user-chip-btn" title="${_user.email}">
          <span class="user-chip-avatar">${initials}</span>
          <span class="user-chip-email">${_user.email}</span>
          <svg class="user-chip-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          <div class="user-chip-dropdown" id="user-dropdown">
            <div class="user-chip-dropdown-email">${_user.email}</div>
            <button class="user-chip-logout" id="btn-logout">Sair da conta</button>
          </div>
        </div>
      `;

      // Dropdown toggle
      const chip = document.getElementById('user-chip-btn');
      const dropdown = document.getElementById('user-dropdown');
      chip?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => dropdown?.classList.remove('open'), { once: false });

      document.getElementById('btn-logout')?.addEventListener('click', () => Auth.logout());

      // Esconde botão "Novo Setup" em páginas que não sejam index.html
      const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
      const newSetupBtn = document.getElementById('btn-new-setup');
      if (newSetupBtn && !isIndex) newSetupBtn.style.display = 'none';

    } else {
      area.innerHTML = `
        <button class="btn btn-primary" id="btn-open-auth-modal">
          Login
        </button>
      `;
      document.getElementById('btn-open-auth-modal')?.addEventListener('click', () => Auth.openModal());
    }
  }

  // ── Injeção do Modal ──────────────────────────────────────

  function _injectModal() {
    if (_modalInjected || document.getElementById('auth-modal-overlay')) return;
    _modalInjected = true;

    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'auth-modal-overlay';
    overlay.innerHTML = `
      <div class="auth-modal" id="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button class="auth-modal-close" id="auth-modal-close" aria-label="Fechar">&times;</button>

        <div class="auth-modal-logo">Taborda<em>Setups</em></div>

        <div class="auth-modal-tabs" role="tablist">
          <button class="auth-tab active" id="tab-login" role="tab" aria-selected="true">Entrar</button>
          <button class="auth-tab" id="tab-register" role="tab" aria-selected="false">Criar Conta</button>
        </div>

        <form class="auth-modal-form" id="auth-form" novalidate>

          <!-- Campo somente no cadastro -->
          <div class="form-field" id="field-name" style="display:none">
            <label class="form-label" for="auth-name">Nome de exibição</label>
            <input type="text" class="form-input" id="auth-name" placeholder="Seu nome" autocomplete="name" />
          </div>

          <div class="form-field">
            <label class="form-label" for="auth-email">E-mail</label>
            <input type="email" class="form-input" id="auth-email" placeholder="seu@email.com" autocomplete="email" required />
          </div>

          <div class="form-field">
            <label class="form-label" for="auth-pass">Senha</label>
            <input type="password" class="form-input" id="auth-pass" placeholder="Mínimo 6 caracteres" autocomplete="current-password" required />
          </div>

          <!-- Confirmação somente no cadastro -->
          <div class="form-field" id="field-confirm" style="display:none">
            <label class="form-label" for="auth-confirm">Confirmar senha</label>
            <input type="password" class="form-input" id="auth-confirm" placeholder="Repita a senha" autocomplete="new-password" />
          </div>

          <div class="auth-modal-error" id="auth-error" style="display:none"></div>

          <button type="submit" class="btn btn-primary auth-modal-submit" id="auth-submit">
            Entrar
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    // ── Event listeners do modal ──

    // Fechar
    document.getElementById('auth-modal-close').addEventListener('click', Auth.closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) Auth.closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Auth.closeModal(); });

    // Abas
    document.getElementById('tab-login').addEventListener('click', () => _switchTab('login'));
    document.getElementById('tab-register').addEventListener('click', () => _switchTab('register'));

    // Submit
    document.getElementById('auth-form').addEventListener('submit', _handleSubmit);
  }

  let _currentTab = 'login';

  function _switchTab(tab) {
    _currentTab = tab;
    const isRegister = tab === 'register';

    document.getElementById('tab-login').classList.toggle('active', !isRegister);
    document.getElementById('tab-register').classList.toggle('active', isRegister);

    document.getElementById('field-name').style.display = isRegister ? '' : 'none';
    document.getElementById('field-confirm').style.display = isRegister ? '' : 'none';
    document.getElementById('auth-submit').textContent = isRegister ? 'Criar Conta' : 'Entrar';
    document.getElementById('auth-pass').autocomplete = isRegister ? 'new-password' : 'current-password';

    _clearError();
  }

  function _setError(msg) {
    const el = document.getElementById('auth-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function _clearError() {
    const el = document.getElementById('auth-error');
    if (el) el.style.display = 'none';
  }

  function _translateError(err) {
    const msg = err?.message || '';
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (msg.includes('User already registered')) return 'Esse e-mail já está cadastrado.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('Unable to validate email')) return 'Endereço de e-mail inválido.';
    if (msg.includes('signup is disabled')) return 'Cadastro desabilitado. Contate o administrador.';
    return msg || 'Erro desconhecido. Tente novamente.';
  }

  async function _handleSubmit(e) {
    e.preventDefault();
    _clearError();

    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    const submit = document.getElementById('auth-submit');

    if (!email || !pass) { _setError('Preencha todos os campos.'); return; }

    submit.disabled = true;
    submit.textContent = _currentTab === 'login' ? 'Entrando...' : 'Criando conta...';

    try {
      if (_currentTab === 'login') {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        Auth.closeModal();
        // onAuthStateChange vai atualizar o header e recarregar setups
      } else {
        // Cadastro
        const confirm = document.getElementById('auth-confirm').value;
        if (pass !== confirm) {
          _setError('As senhas não coincidem.');
          submit.disabled = false;
          submit.textContent = 'Criar Conta';
          return;
        }
        if (pass.length < 6) {
          _setError('A senha deve ter pelo menos 6 caracteres.');
          submit.disabled = false;
          submit.textContent = 'Criar Conta';
          return;
        }

        const { error } = await supabaseClient.auth.signUp({ email, password: pass });
        if (error) throw error;
        Auth.closeModal();
        _showToast('🎉 Usuário cadastrado com sucesso! Faça login para continuar.', 'success');
      }
    } catch (err) {
      _setError(_translateError(err));
      submit.disabled = false;
      submit.textContent = _currentTab === 'login' ? 'Entrar' : 'Criar Conta';
    }
  }

  // ── API Pública ───────────────────────────────────────────

  return {
    /** Inicializa o módulo de auth (chamar no DOMContentLoaded de cada página) */
    async init(options = {}) {
      if (!supabaseClient) {
        console.warn('[Auth] Supabase não inicializado.');
        _updateHeader();
        return;
      }

      // Sessão inicial
      const { data: { session } } = await supabaseClient.auth.getSession();
      _user = session?.user || null;

      // Injeta o modal e atualiza o header
      _injectModal();
      _updateHeader();

      // Página protegida: redireciona se não logado
      if (options.protected && !_user) {
        window.location.replace('index.html');
        return;
      }

      // Listener de mudança de estado
      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        _user = session?.user || null;
        _updateHeader();

        if (event === 'SIGNED_IN') {
          // Recarrega setups na página principal
          if (typeof loadAndRender === 'function') await loadAndRender();
        }
        if (event === 'SIGNED_OUT') {
          if (typeof loadAndRender === 'function') await loadAndRender();
        }
      });
    },

    /** Usado em páginas protegidas sem carregamento async no head */
    requireAuth() {
      // Será verificado no init({ protected: true })
      // Mantido para compatibilidade — o init() é chamado via DOMContentLoaded
    },

    isAuthenticated() {
      return !!_user;
    },

    getUser() {
      return _user;
    },

    async logout() {
      await supabaseClient.auth.signOut();
    },

    openModal() {
      _switchTab('login');
      document.getElementById('auth-modal-overlay')?.classList.add('open');
      setTimeout(() => document.getElementById('auth-email')?.focus(), 100);
    },

    closeModal() {
      document.getElementById('auth-modal-overlay')?.classList.remove('open');
      document.getElementById('auth-form')?.reset();
      _clearError();
    },
  };
})();

// Auto-inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Lê o atributo data-protected do body para páginas protegidas
  const isProtected = document.body.dataset.authProtected === 'true';
  Auth.init({ protected: isProtected });
});
