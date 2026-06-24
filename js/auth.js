// ============================================================
//  LMU SETUPS — auth.js
//  Autenticação real via Supabase Auth
//  Login por USUÁRIO + SENHA (email fake: usuario@lmu-setups.app)
//  Modal de Login/Cadastro injetado dinamicamente no header
// ============================================================

const Auth = (() => {
  let _user = null;
  let _modalInjected = false;

  // Domínio fake usado internamente — o usuário nunca vê isso
  const FAKE_DOMAIN = 'lmu-setups.app';

  // ── Conversores username ↔ fake email ─────────────────────

  function _toFakeEmail(username) {
    return `${username.toLowerCase().trim()}@${FAKE_DOMAIN}`;
  }

  function _fromFakeEmail(email) {
    if (!email) return '';
    const raw = email.endsWith(`@${FAKE_DOMAIN}`)
      ? email.replace(`@${FAKE_DOMAIN}`, '')
      : email.split('@')[0];
    
    // Capitaliza a primeira letra de cada palavra separada por ponto, traço ou underline
    return raw.split(/([._-])/).map(part => {
      if (/^[._-]$/.test(part)) return part; // mantém o separador
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');
  }

  function _getInitials(email) {
    const username = _fromFakeEmail(email);
    if (!username) return '?';
    const parts = username.split(/[._-]/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || username[0].toUpperCase();
  }

  function _getAvatarColor(username) {
    const AVATAR_COLORS = [
      '#e8002d', // Vermelho LMU
      '#f5a623', // Amarelo/Ouro
      '#2563eb', // Azul
      '#8b5cf6', // Roxo
      '#ec4899', // Rosa
      '#10b981', // Verde
      '#06b6d4', // Ciano
      '#f97316', // Laranja
      '#14b8a6', // Teal
      '#a855f7', // Roxo claro
      '#6366f1'  // Indigo
    ];
    if (!username) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }

  function _validateUsername(username) {
    if (!username || username.length < 3) return 'O usuário deve ter pelo menos 3 caracteres.';
    if (username.length > 30) return 'O usuário deve ter no máximo 30 caracteres.';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Use apenas letras, números, _ ou -. Sem espaços.';
    return null; // válido
  }

  // ── Toast ─────────────────────────────────────────────────

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

  function _initPasswordToggle(container) {
    const toggles = container.querySelectorAll('.btn-toggle-password');
    toggles.forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "true";
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          `;
          btn.setAttribute('aria-label', 'Esconder senha');
        } else {
          input.type = 'password';
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
          btn.setAttribute('aria-label', 'Mostrar senha');
        }
      });
    });
  }

  // ── Atualiza área do header ───────────────────────────────

  function _updateHeader() {
    const area = document.getElementById('header-auth-area');
    if (!area) return;

    if (_user) {
      const username = _fromFakeEmail(_user.email);
      const initials = _getInitials(_user.email);
      const avatarColor = _getAvatarColor(username);

      area.innerHTML = `
        <a href="add-setup.html" class="btn btn-primary" id="btn-new-setup">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
          <span class="btn-text">Novo Setup</span>
        </a>
        <div class="user-chip" id="user-chip-btn" title="${username}">
          <span class="user-chip-avatar" style="background:${avatarColor}">${initials}</span>
          <span class="user-chip-email">${username}</span>
          <svg class="user-chip-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          <div class="user-chip-dropdown" id="user-dropdown">
            <div class="user-chip-dropdown-email">👤 ${username}</div>
            <button class="user-chip-action" id="btn-change-pass">Alterar senha</button>
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
      document.addEventListener('click', () => dropdown?.classList.remove('open'));

      document.getElementById('btn-logout')?.addEventListener('click', () => Auth.logout());
      document.getElementById('btn-change-pass')?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('open');
        Auth.openPasswordModal();
      });

      // Esconde "Novo Setup" fora do index.html
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

        <form class="auth-modal-form" id="auth-form" method="POST" novalidate>

          <div class="form-field">
            <label class="form-label" for="auth-username">Usuário</label>
            <input
              type="text"
              name="username"
              class="form-input"
              id="auth-username"
              placeholder="Seu usuário (ex: irwayne)"
              autocomplete="username"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              required
            />
            <span class="auth-field-hint" id="username-hint" style="display:none">
               Use letras, números, _ ou - (sem espaços)
            </span>
          </div>

          <div class="form-field">
            <label class="form-label" for="auth-pass">Senha</label>
            <div class="password-wrapper">
              <input type="password" name="password" class="form-input" id="auth-pass" placeholder="Sua senha" autocomplete="current-password" required />
              <button type="button" class="btn-toggle-password" tabindex="-1" aria-label="Mostrar senha">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirmação somente no cadastro -->
          <div class="form-field" id="field-confirm" style="display:none">
            <label class="form-label" for="auth-confirm">Confirmar senha</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="auth-confirm" placeholder="Repita a senha" autocomplete="new-password" />
              <button type="button" class="btn-toggle-password" tabindex="-1" aria-label="Mostrar senha">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <!-- Lembrar de mim checkbox -->
          <div class="form-field checkbox-field" id="field-remember">
            <label class="checkbox-container">
              <input type="checkbox" id="auth-remember" checked />
              <span class="checkbox-checkmark"></span>
              Lembrar de mim
            </label>
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

    document.getElementById('auth-modal-close').addEventListener('click', Auth.closeModal);
    
    // Corrige bug de fechar ao selecionar texto:
    // Só fecha se o click de início (mousedown) E término (mouseup) foram fora do modal
    let mousedownTarget = null;
    overlay.addEventListener('mousedown', (e) => {
      mousedownTarget = e.target;
    });
    overlay.addEventListener('mouseup', (e) => {
      if (mousedownTarget === overlay && e.target === overlay) {
        Auth.closeModal();
      }
      mousedownTarget = null;
    });
    
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Auth.closeModal(); });

    document.getElementById('tab-login').addEventListener('click', () => _switchTab('login'));
    document.getElementById('tab-register').addEventListener('click', () => _switchTab('register'));

    // Mostra dica do username ao focar no cadastro
    document.getElementById('auth-username').addEventListener('focus', () => {
      if (_currentTab === 'register') {
        document.getElementById('username-hint').style.display = 'block';
      }
    });

    document.getElementById('auth-form').addEventListener('submit', _handleSubmit);
    _initPasswordToggle(overlay);
  }

  let _currentTab = 'login';

  function _switchTab(tab) {
    _currentTab = tab;
    const isRegister = tab === 'register';

    document.getElementById('tab-login').classList.toggle('active', !isRegister);
    document.getElementById('tab-register').classList.toggle('active', isRegister);

    document.getElementById('field-confirm').style.display = isRegister ? '' : 'none';
    document.getElementById('field-remember').style.display = isRegister ? 'none' : '';
    document.getElementById('username-hint').style.display = isRegister ? 'block' : 'none';
    document.getElementById('auth-submit').textContent = isRegister ? 'Criar Conta' : 'Entrar';
    document.getElementById('auth-pass').autocomplete = isRegister ? 'new-password' : 'current-password';
    document.getElementById('auth-pass').placeholder = isRegister ? 'Mínimo 6 caracteres' : 'Sua senha';
    document.getElementById('auth-username').placeholder = isRegister
      ? 'Escolha um usuário (ex: irwayne)'
      : 'Seu usuário';

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
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) return 'Usuário ou senha incorretos.';
    if (msg.includes('Email not confirmed'))            return 'Conta não confirmada. Contate o administrador.';
    if (msg.includes('User already registered'))        return 'Esse usuário já está cadastrado.';
    if (msg.includes('Password should be at least'))    return 'A senha deve ter pelo menos 6 caracteres.';
    if (msg.includes('Unable to validate email'))       return 'Nome de usuário inválido.';
    if (msg.includes('signup is disabled'))             return 'Cadastro desabilitado. Contate o administrador.';
    if (msg.includes('Email provider is not enabled'))  return 'Configuração de auth incorreta. Contate o administrador.';
    return msg || 'Erro desconhecido. Tente novamente.';
  }

  async function _handleSubmit(e) {
    e.preventDefault();
    _clearError();

    const usernameRaw = document.getElementById('auth-username').value.trim();
    const pass        = document.getElementById('auth-pass').value;
    const submit      = document.getElementById('auth-submit');

    // Validação do username
    const usernameError = _validateUsername(usernameRaw);
    if (usernameError) { _setError(usernameError); return; }
    if (!pass) { _setError('Preencha a senha.'); return; }

    // Converte para fake email internamente
    const fakeEmail = _toFakeEmail(usernameRaw);

    submit.disabled = true;
    submit.textContent = _currentTab === 'login' ? 'Entrando...' : 'Criando conta...';

    try {
      if (_currentTab === 'login') {
        const remember = document.getElementById('auth-remember')?.checked ?? true;
        
        // Se desmarcado 'Lembrar de mim', podemos ajustar o persistence.
        // O Supabase JS v2 gerencia isso se configurarmos no cliente, mas podemos simular limpando a session storage
        // ou deixando o padrão. O Supabase persiste por padrão no localStorage se não configurado.
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: fakeEmail,
          password: pass,
        });
        if (error) throw error;
        
        // Tenta salvar credenciais no gerenciador nativo do browser (Credential Management API)
        if (window.PasswordCredential) {
          try {
            const cred = new PasswordCredential({
              id: usernameRaw,
              password: pass,
              name: usernameRaw
            });
            await navigator.credentials.store(cred);
          } catch (credErr) {
            console.warn('[Auth] Falha ao salvar credenciais:', credErr);
          }
        }
        
        // Se o usuário desmarcou 'Lembrar de mim', configuramos no sessionStorage que ao fechar a aba a sessão expira
        if (!remember) {
          // Marcamos um flag para remover o token no logout / encerramento
          sessionStorage.setItem('lmu_auth_no_remember', 'true');
        } else {
          sessionStorage.removeItem('lmu_auth_no_remember');
        }

        _user = data.user;
        Auth.closeModal();
        _updateHeader();
        
        // Garante que o estado local foi propagado e dispara o callback
        if (typeof loadAndRender === 'function') {
          await loadAndRender();
        } else {
          window.location.reload();
        }

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

        const { error } = await supabaseClient.auth.signUp({
          email: fakeEmail,
          password: pass,
          options: {
            data: { username: usernameRaw }, // salva o username real nos metadados
          },
        });
        if (error) throw error;
        Auth.closeModal();
        _showToast(`🎉 Usuário "${usernameRaw}" cadastrado com sucesso!`, 'success');
      }
    } catch (err) {
      _setError(_translateError(err));
      submit.disabled = false;
      submit.textContent = _currentTab === 'login' ? 'Entrar' : 'Criar Conta';
    }
  }

  // ── API Pública ───────────────────────────────────────────

  return {
    /** Inicializa o módulo de auth (chamado via DOMContentLoaded) */
    async init(options = {}) {
      if (!supabaseClient) {
        console.warn('[Auth] Supabase não inicializado.');
        _updateHeader();
        return;
      }

      // Tratamento para a opção 'Lembrar de mim':
      // Se não lembrou, encerra a sessão quando uma nova sessão de aba iniciar.
      if (sessionStorage.getItem('lmu_auth_no_remember') === 'true') {
        const hasCheckedSessionThisTab = sessionStorage.getItem('lmu_session_checked');
        if (!hasCheckedSessionThisTab) {
          await supabaseClient.auth.signOut();
          _user = null;
          sessionStorage.setItem('lmu_session_checked', 'true');
        }
      } else {
        sessionStorage.setItem('lmu_session_checked', 'true');
      }

      const { data: { session } } = await supabaseClient.auth.getSession();
      _user = session?.user || null;

      _injectModal();
      _updateHeader();

      // Página protegida → redireciona se não logado
      if (options.protected && !_user) {
        window.location.replace('index.html');
        return;
      }

      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        _user = session?.user || null;
        _updateHeader();

        if (options.protected && !_user) {
          window.location.replace('index.html');
          return;
        }

        if (event === 'SIGNED_IN') {
          if (typeof loadAndRender === 'function') await loadAndRender();
        }
        if (event === 'SIGNED_OUT') {
          if (typeof loadAndRender === 'function') await loadAndRender();
        }
      });
    },

    /** Mantido para compatibilidade — proteção via data-auth-protected="true" no body */
    requireAuth() {},

    isAuthenticated() {
      return !!_user;
    },

    getUser() {
      return _user;
    },

    /** Retorna o username legível (sem o domínio fake) */
    getUsername() {
      return _user ? _fromFakeEmail(_user.email) : null;
    },

    getAvatarColor(username) {
      return _getAvatarColor(username);
    },

    async logout() {
      await supabaseClient.auth.signOut();
    },

    openModal() {
      _switchTab('login');
      document.getElementById('auth-modal-overlay')?.classList.add('open');
      setTimeout(() => document.getElementById('auth-username')?.focus(), 100);
    },

    closeModal() {
      document.getElementById('auth-modal-overlay')?.classList.remove('open');
      document.getElementById('auth-form')?.reset();
      _clearError();
    },

    openPasswordModal() {
      // Cria e injeta o modal de alterar senha se ele não existir
      let passOverlay = document.getElementById('change-pass-overlay');
      if (!passOverlay) {
        passOverlay = document.createElement('div');
        passOverlay.id = 'change-pass-overlay';
        passOverlay.className = 'auth-modal-overlay';
        passOverlay.innerHTML = `
          <div class="auth-modal" role="dialog" aria-modal="true">
            <button class="auth-modal-close" id="change-pass-close" aria-label="Fechar">&times;</button>
            <div class="auth-modal-logo">Alterar <em>Senha</em></div>
            
            <form class="auth-modal-form" id="change-pass-form">
              <div class="form-field">
                <label class="form-label" for="change-pass-new">Nova Senha</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input" id="change-pass-new" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required />
                  <button type="button" class="btn-toggle-password" tabindex="-1" aria-label="Mostrar senha">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label" for="change-pass-confirm">Confirmar Nova Senha</label>
                <div class="password-wrapper">
                  <input type="password" class="form-input" id="change-pass-confirm" placeholder="Repita a nova senha" autocomplete="new-password" required />
                  <button type="button" class="btn-toggle-password" tabindex="-1" aria-label="Mostrar senha">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="auth-modal-error" id="change-pass-error" style="display:none"></div>
              <button type="submit" class="btn btn-primary auth-modal-submit" id="change-pass-submit">
                Salvar Nova Senha
              </button>
            </form>
          </div>
        `;
        document.body.appendChild(passOverlay);

        // Eventos do modal de senha
        document.getElementById('change-pass-close').addEventListener('click', () => {
          passOverlay.classList.remove('open');
        });

        // Corrige bug de fechar ao selecionar texto:
        // Só fecha se o click de início (mousedown) E término (mouseup) foram fora do modal
        let passMousedownTarget = null;
        passOverlay.addEventListener('mousedown', (e) => {
          passMousedownTarget = e.target;
        });
        passOverlay.addEventListener('mouseup', (e) => {
          if (passMousedownTarget === passOverlay && e.target === passOverlay) {
            passOverlay.classList.remove('open');
          }
          passMousedownTarget = null;
        });

        document.getElementById('change-pass-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const errorEl = document.getElementById('change-pass-error');
          errorEl.style.display = 'none';

          const newPass = document.getElementById('change-pass-new').value;
          const confirmPass = document.getElementById('change-pass-confirm').value;
          const submitBtn = document.getElementById('change-pass-submit');

          if (newPass !== confirmPass) {
            errorEl.textContent = 'As senhas não coincidem.';
            errorEl.style.display = 'block';
            return;
          }
          if (newPass.length < 6) {
            errorEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
            errorEl.style.display = 'block';
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = 'Salvando...';

          try {
            const { error } = await supabaseClient.auth.updateUser({
              password: newPass
            });
            if (error) throw error;
            
            passOverlay.classList.remove('open');
            document.getElementById('change-pass-form').reset();
            _showToast('🔑 Senha alterada com sucesso!', 'success');
          } catch (err) {
            errorEl.textContent = _translateError(err);
            errorEl.style.display = 'block';
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Salvar Nova Senha';
          }
        });
        _initPasswordToggle(passOverlay);
      }

      // Abre o modal
      document.getElementById('change-pass-error').style.display = 'none';
      document.getElementById('change-pass-form').reset();
      passOverlay.classList.add('open');
      setTimeout(() => document.getElementById('change-pass-new')?.focus(), 100);
    }
  };
})();

// Auto-inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const isProtected = document.body.dataset.authProtected === 'true';
  Auth.init({ protected: isProtected });
});
