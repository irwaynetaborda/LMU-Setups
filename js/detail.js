// ============================================================
//  LMU SETUPS — detail.js
//  Lógica da página de detalhe (setup-detail.html)
// ===========================================================
//  LMU SETUPS — detail.js
//  Lógica da página de detalhe (setup-detail.html)
// ===========================================================

let currentSetup = null;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPage();
});

async function initPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { redirect(); return; }

  currentSetup = await Storage.getById(id);
  if (!currentSetup) { redirect(); return; }

  document.title = buildTitle(currentSetup) + ' — Taborda Setups';

  renderDetail(currentSetup);
  bindModal();
  await loadAndRenderComments(id);
}

// Para recarregar ao fazer login/logout
window.loadAndRender = async function() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (id) {
    currentSetup = await Storage.getById(id);
    if (currentSetup) {
      renderDetail(currentSetup);
      await loadAndRenderComments(id);
    }
  }
};

function redirect() {
  window.location.href = 'index.html';
}

// ── BUILD TITLE ───────────────────────────────────────────────
function buildTitle(s) {
  const car   = LMU_DATA.getCarById(s.carId);
  const track = LMU_DATA.getTrackById(s.trackId);
  return `${car?.name || '?'} @ ${track?.shortName || '?'}`;
}

// ── RENDER DETAIL ─────────────────────────────────────────────
function renderDetail(s) {
  const car    = LMU_DATA.getCarById(s.carId);
  const track  = LMU_DATA.getTrackById(s.trackId);
  const cls    = LMU_DATA.getClassById(s.classId);
  const cond   = LMU_DATA.conditions.find(c => c.id === s.condition);
  const sess   = LMU_DATA.sessionTypes.find(t => t.id === s.sessionType);
  const series = LMU_DATA.series.find(sr => sr.id === s.series);

  const carName   = car?.name     || s.carId   || '—';
  const trackName = track?.name   || s.trackId || '—';
  const clsName   = cls?.name     || s.classId || '—';
  const hasABS    = LMU_DATA.classHasABS(s.classId);
  const isLMP3    = s.classId === 'lmp3';

  const brand = car && car.brand ? LMU_DATA.brands[car.brand] : null;
  let logoHtml = '';
  if (brand) {
    if (brand.logo) {
      logoHtml = `<img src="${brand.logo}" class="car-logo" style="width: 36px; height: 36px; opacity: 1;" alt="${brand.name}" title="${brand.name}">`;
    } else {
      logoHtml = `<div class="car-logo-fallback" style="width: 36px; height: 36px; font-size: 0.875rem;" title="${brand.name}">${brand.short || brand.name.charAt(0)}</div>`;
    }
  } else {
    logoHtml = `<div class="car-logo-fallback" style="width: 36px; height: 36px; font-size: 0.875rem;">?</div>`;
  }

  document.getElementById('loading').style.display = 'none';
  const root = document.getElementById('detail-root');
  root.style.display = 'block';

  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  const currentUserId = isLoggedIn ? Auth.getUser()?.id : null;
  const activeUsername = (typeof Auth !== 'undefined') ? Auth.getUsername() : null;
  const isAdmin = activeUsername && activeUsername.toLowerCase() === 'taborda';
  const isOwner = (s.userId && s.userId === currentUserId) || isAdmin;

  let hasVoted = false;
  if (isLoggedIn && currentUserId) {
    try {
      const votedKey = `voted_setups_${currentUserId}`;
      const voted = JSON.parse(localStorage.getItem(votedKey) || '[]');
      hasVoted = voted.includes(s.id);
    } catch (e) {
      hasVoted = false;
    }
  }

  const canDownload = s.isPublic || isOwner;
  const downloadBtn = canDownload
    ? `<button class="btn-icon-download" id="btn-download-svm" title="Baixar .svm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Download</span></button>`
    : '';

  const ownerButtons = isOwner
    ? `<a href="add-setup.html?edit=${s.id}" class="btn btn-secondary btn-sm" title="Editar setup">✏️ Editar</a>
       <button class="btn btn-danger btn-sm" id="btn-delete" title="Deletar setup">🗑 Deletar</button>`
    : '';

  // actionsHtml — só renderiza se houver algo
  const hasActions = isOwner || canDownload;
  const actionsHtml = hasActions
    ? (isOwner
        ? `${downloadBtn}${ownerButtons}`
        : downloadBtn)
    : '';

  const creatorName = s.creatorUsername || 'Piloto';
  const initials = getInitials(creatorName);
  const trackMapUrl = getTrackMapUrl(trackName);
  const avatarColor = (typeof Auth !== 'undefined') ? Auth.getAvatarColor(creatorName) : '#e8002d';

  root.innerHTML = `
    <!-- HERO -->
    <section class="detail-hero animate-in">
      <div class="container">
        <div class="detail-hero-layout">

          <div class="detail-hero-content">
            <div class="detail-badge-row">
              <span class="badge ${s.classId}">${clsName}</span>
              <span class="badge-setup-type ${s.setupType || 'fixed'}">${(s.setupType || 'fixed') === 'open' ? 'Aberto' : 'Fixo'}</span>
              ${s.carYear ? `<span class="badge" style="background:var(--bg-overlay);color:var(--text-2);border:1px solid var(--border)">${s.carYear}</span>` : ''}
              ${s.carVersion ? `<span class="badge" style="background:var(--bg-overlay);color:var(--gold-light);border:1px solid rgba(245,166,35,0.35)" title="Versão do carro/física">v${s.carVersion}</span>` : ''}
              <button class="btn-vote ${hasVoted ? 'voted' : ''}" onclick="voteSetup('${s.id}', event)" title="${hasVoted ? 'Você já votou' : 'Votar neste setup'}">
                <span class="star-icon">★</span>
                <span class="vote-count">${s.votes || 0}</span>
              </button>
            </div>

            <h1 class="detail-title" style="display:flex; align-items:center; gap:var(--s3);">
              ${logoHtml}
              <span>${carName}</span>
            </h1>
            <p class="detail-sub">
              ${track?.flag || ''} ${track?.shortName ? `${track.shortName} — ` : ''}${trackName}${s.trackLayout ? ` — ${s.trackLayout}` : ''}
            </p>

            <div class="detail-creator-chip" title="Criador do setup" style="margin-top:var(--s4); margin-bottom:var(--s4);">
              <div class="avatar-small" style="background:${avatarColor}">${initials}</div>
              <span>Criador: <strong>${creatorName}</strong></span>
            </div>

            ${(cond || sess || series) ? `
            <div class="detail-tags">
              ${cond   ? `<span class="detail-tag">${cond.icon}  ${cond.name}</span>`   : ''}
              ${sess   ? `<span class="detail-tag">${sess.icon}  ${sess.name}</span>`   : ''}
              ${series ? `<span class="detail-tag">🏆 ${series.name}</span>`            : ''}
            </div>` : ''}

          </div> <!-- /detail-hero-content -->

          <!-- Sidebar container for actions & reference -->
          <div class="detail-hero-sidebar">
            ${isOwner
              ? `<div class="detail-hero-actions">${actionsHtml}</div>`
              : (canDownload ? `<div class="detail-hero-actions">${downloadBtn}</div>` : '')
            }

            <div class="detail-hero-reference">
              <div class="detail-hero-reference-title">📋 Referência Rápida</div>
              <div class="detail-hero-reference-grid">
                <div class="ref-item">
                  <span class="ref-label">Brake Bias</span>
                  <span class="ref-value">${formatBB(s.brakeBias)}</span>
                </div>
                <div class="ref-item">
                  <span class="ref-label">Traction Control</span>
                  <span class="ref-value">${s.tc ?? '—'}</span>
                </div>
                <div class="ref-item">
                  <span class="ref-label">TC Power Cut</span>
                  <span class="ref-value">${s.tcPowerCut ?? '—'}</span>
                </div>
                <div class="ref-item">
                  <span class="ref-label">TC Slip Angle</span>
                  <span class="ref-value">${isLMP3 ? 'Linked' : (s.tcSlipAngle ?? '—')}</span>
                </div>
                ${hasABS ? `
                <div class="ref-item">
                  <span class="ref-label">ABS</span>
                  <span class="ref-value">${s.abs ?? '—'}</span>
                </div>` : ''}
                <div class="ref-item">
                  <span class="ref-label">Brake Pressure</span>
                  <span class="ref-value">${s.brakePressure ?? '—'}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-meta" style="position: absolute; bottom: var(--s4); left: var(--s6); z-index: 2;">
            <div class="detail-meta-item" style="display: flex; gap: var(--s2); align-items: center;">
              <strong style="margin-bottom: 0;">Data:</strong>
              <span>${s.date ? formatDate(s.date) : '—'}</span>
            </div>
          </div>

          <img src="${trackMapUrl}" class="detail-hero-track-map" alt="Mapa da pista" onerror="this.style.display='none'" />

        </div> <!-- /detail-hero-layout -->
      </div>
    </section>

    <!-- CONTENT -->
    <section class="detail-content animate-in" style="animation-delay:80ms">
      <div class="container">
        <div class="detail-layout">

          <!-- Left: Parameters -->
          <div>
            ${s.setupType === 'open' 
              ? renderOpenParams(s.openParams, isLMP3, hasABS)
              : `
              <div class="detail-card card-with-header" style="margin-bottom:var(--s5); background:#08080eeb;">
                <div class="detail-card-title">⚙️ Parâmetros Fixed Setup</div>
                <div class="detail-card-body">
                  <div class="param-items">
                    ${renderParamItem('Brake Bias', s.brakeBias, 45, 70, false, true)}
                    ${renderParamItem('TC', s.tc, 1, 11)}
                    ${renderParamItem('TC Power Cut', s.tcPowerCut, 1, 11)}
                    ${isLMP3
                      ? `<div class="param-item" style="opacity:0.35">
                           <span class="param-item-label">TC Slip Angle</span>
                           <span class="param-item-val" style="font-size:0.875rem;color:var(--text-3)">Linked</span>
                         </div>`
                      : renderParamItem('TC Slip Angle', s.tcSlipAngle, 1, 11)
                    }
                    ${hasABS
                      ? renderParamItem('ABS', s.abs, 1, 11)
                      : `<div class="param-item" style="opacity:0.35">
                           <span class="param-item-label">ABS</span>
                           <span class="param-item-val" style="font-size:0.75rem;color:var(--text-3)">N/A (LMP3)</span>
                         </div>`
                    }
                    ${renderParamItem('Brake Pressure', s.brakePressure, 50, 100, true)}
                  </div>
                </div>
              </div>`
            }

            <!-- Feedbacks da Comunidade -->
            <div id="comments-section-root"></div>
          </div>

          <!-- Right: Laptime + Rating + Notes -->
          <div style="display:flex;flex-direction:column;gap:var(--s5)">

            <!-- Laptime -->
            <div class="detail-card" style="text-align:center">
              <div class="detail-card-title">⏱️ Tempo de Volta</div>
              <div class="laptime-display ${!s.laptime ? 'empty' : ''}">
                ${s.laptime || 'Não registrado'}
              </div>
            </div>

            <!-- Rating -->
            <div class="detail-card detail-rating-card" style="text-align:center">
              <div class="detail-card-title">⭐ Avaliação</div>
              <div class="rating-display" style="margin-top:var(--s2)">
                <div class="stars">
                  ${[1,2,3,4,5].map(i =>
                    `<span class="star ${i <= (s.rating||0) ? 'on' : ''}">★</span>`
                  ).join('')}
                </div>
                <span class="rating-text">${ratingLabel(s.rating)}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="detail-card">
              <div class="detail-card-title">📝 Comentários &amp; Notas</div>
              ${s.notes
                ? `<p class="notes-text" style="white-space: pre-wrap;">${escapeHtml(s.notes)}</p>`
                : `<p class="notes-text empty">Nenhum comentário adicionado.</p>`
              }
            </div>

          </div>
        </div>
      </div>
    </section>`;

  // Bind buttons
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) btnDelete.addEventListener('click', () => openModal());
  const btnDownload = document.getElementById('btn-download-svm');
  if (btnDownload) {
    btnDownload.addEventListener('click', async () => {
      const setup = await Storage.getById(s.id);
      const content = window.SVM.gerarSVM(setup);
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const trackObj = LMU_DATA.getTrackById(setup.trackId);
      const trackSlug = (trackObj?.shortName || setup.trackId || 'track')
        .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
      const name = `${trackSlug}-${setup.carId}-${setup.setupType || 'fixed'}.svm`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('📥 Arquivo .svm baixado com sucesso.', 'success');
    });
  }
  if (s.setupType === 'open') {
    bindOpenParamsTabs();
  }

  // Animate bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.param-item-bar[data-pct]').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  });
}

// ── PARAM ITEM RENDERER ───────────────────────────────────────
function formatBB(val) {
  if (val == null) return '—';
  const rear = (100 - val).toFixed(1);
  return `${Number(val).toFixed(1)} / ${rear}`;
}

function renderParamItem(label, value, min, max, isPercent = false, isBB = false) {
  if (value == null) return '';
  const rawPct = Math.round(((value - min) / (max - min)) * 100);
  // Garante barra mínima visível (4%) mesmo no valor mínimo
  const pct = rawPct === 0 ? 4 : rawPct;
  let display = value;
  if (isPercent) display = `${value}%`;
  if (isBB) display = formatBB(value);

  return `
    <div class="param-item">
      <span class="param-item-label">${label}</span>
      <div class="param-item-bar-wrap">
        <div class="param-item-bar" data-pct="${pct}" style="width:0%"></div>
      </div>
      <span class="param-item-val">${display}</span>
    </div>`;
}

// ── DELETE MODAL ──────────────────────────────────────────────
function bindModal() {
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmDelete);
  document.getElementById('modal-delete').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function openModal()  { document.getElementById('modal-delete').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-delete').style.display = 'none'; }

async function confirmDelete() {
  await Storage.delete(currentSetup.id);
  sessionStorage.setItem('toast_msg',  'Setup deletado.');
  sessionStorage.setItem('toast_type', 'error');
  window.location.href = 'index.html';
}

// ── HELPERS ───────────────────────────────────────────────────
function ratingLabel(r) {
  const labels = ['Sem avaliação', 'Horrível', 'Ruim', 'OK', 'Bom', 'Excelente'];
  return labels[r || 0];
}

function formatDate(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  try {
    return new Date(isoStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return isoStr; }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── CREATOR & TRACK MAP HELPERS ────────────────────────────────
function getInitials(username) {
  if (!username) return '?';
  const parts = username.split(/[._-]/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || username[0].toUpperCase();
}

function getTrackMapUrl(trackName) {
  const TRACK_NAMES = [
    'Spa-Francorchamps', 'Le Mans', 'Bahrain', 'Fuji', 'Monza', 'Sebring', 
    'Portimao', 'Algarve', 'Imola', 'Interlagos', 'COTA', 'Silverstone', 'Lusail', 'Paul Ricard', 'Barcelona'
  ];
  let foundKey = 'default';
  if (trackName) {
    const t = trackName.toLowerCase();
    for (const key of TRACK_NAMES) {
      if (t.includes(key.toLowerCase()) || 
          (key === 'Portimao' && t.includes('algarve')) ||
          (key === 'Algarve' && t.includes('portimao')) ||
          (key === 'Le Mans' && t.includes('sarthe')) ||
          (key === 'Lusail' && t.includes('qatar')) ||
          (key === 'Interlagos' && (t.includes('interlagos') || t.includes('carlos pace')))) {
        foundKey = key;
        break;
      }
    }
  }
  
  // Normaliza o nome do arquivo (ex: 'Paul Ricard' -> 'paul-ricard', 'Spa-Francorchamps' -> 'spa-francorchamps')
  let fileName = foundKey.toLowerCase().replace(/\s+/g, '-');
  if (fileName === 'algarve') fileName = 'portimao';
  return `img/maps/${fileName}.png`;
}

// ── VOTING LOGIC ───────────────────────────────────────────────
async function voteSetup(id, event) {
  if (event) event.stopPropagation();

  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  if (!isLoggedIn) {
    showToast('Você precisa fazer login para votar.', 'error');
    return;
  }

  if (currentSetup && currentSetup.userId && currentSetup.userId === Auth.getUser()?.id) {
    showToast('Você não pode votar no seu próprio setup.', 'error');
    return;
  }

  let voted = [];
  const userId = Auth.getUser()?.id || 'anon';
  const votedKey = `voted_setups_${userId}`;
  try {
    voted = JSON.parse(localStorage.getItem(votedKey) || '[]');
  } catch (e) {
    voted = [];
  }

  const alreadyVoted = voted.includes(id);
  let diff = 0;

  if (alreadyVoted) {
    voted = voted.filter(x => x !== id);
    diff = -1;
  } else {
    voted.push(id);
    diff = 1;
  }
  localStorage.setItem(votedKey, JSON.stringify(voted));

  // Update detail object
  if (currentSetup && currentSetup.id === id) {
    currentSetup.votes = Math.max((currentSetup.votes || 0) + diff, 0);
  }

  const newCount = currentSetup ? currentSetup.votes : 0;

  // Update UI immediately
  const btn = document.querySelector(`.btn-vote`);
  if (btn) {
    if (alreadyVoted) {
      btn.classList.remove('voted');
      btn.setAttribute('title', 'Votar neste setup');
    } else {
      btn.classList.add('voted');
      btn.setAttribute('title', 'Você já votou');
    }
    const countEl = btn.querySelector('.vote-count');
    if (countEl) {
      countEl.textContent = newCount;
    }
  }

  // Update database
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const rpcName = diff > 0 ? 'increment_votes' : 'decrement_votes';
      const { error } = await supabaseClient.rpc(rpcName, { row_id: id });
      if (error) throw error;

      // Update offline Storage cache
      const allLocal = Storage._getAllLocal();
      const idx = allLocal.findIndex(s => s.id === id);
      if (idx !== -1) {
        allLocal[idx].votes = newCount;
        allLocal[idx].updatedAt = new Date().toISOString();
        Storage._persist(allLocal);
      }
    } catch (err) {
      console.error("[Supabase] Erro ao alterar voto:", err);
      await Storage.update(id, { votes: newCount });
    }
  } else {
    await Storage.update(id, { votes: newCount });
  }

  if (alreadyVoted) {
    showToast('Voto removido.', 'error');
  } else {
    showToast('Voto registrado! Obrigado.', 'success');
  }
}
window.voteSetup = voteSetup;

function bindOpenParamsTabs() {
  const tabs = document.querySelectorAll('.setup-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.setup-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });
      
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const contentId = `tab-${tab.dataset.tab}`;
      const content = document.getElementById(contentId);
      if (content) {
        content.style.display = 'block';
        content.classList.add('active');
      }
    });
  });
}

function renderOpenParams(openParams, isLMP3, hasABS) {
  if (!openParams) {
    return `
      <div class="detail-card" style="margin-bottom:var(--s5); text-align:center; padding:var(--s10);">
        <p style="color:var(--text-3);">Nenhum detalhe adicional de setup aberto disponível.</p>
      </div>`;
  }

  const getP = (section, key, fallback = '—') => {
    return openParams?.[section]?.[key]?.display || fallback;
  };

  const renderRow = (label, val) => `
    <div class="w-param">
      <span class="w-lbl">${label}</span>
      <span class="w-val">${val}</span>
    </div>`;

  const renderWheelGrid = (title, itemsMapper) => `
    <div class="wheel-grid-title">${title}</div>
    <div class="wheel-grid">
      <!-- FL -->
      <div class="wheel-card FL">
        <div class="wheel-header">FL <span class="wheel-sub">Dianteira Esquerda</span></div>
        <div class="wheel-params">
          ${itemsMapper('FRONTLEFT')}
        </div>
      </div>
      <!-- FR -->
      <div class="wheel-card FR">
        <div class="wheel-header">FR <span class="wheel-sub">Dianteira Direita</span></div>
        <div class="wheel-params">
          ${itemsMapper('FRONTRIGHT')}
        </div>
      </div>
      <!-- RL -->
      <div class="wheel-card RL">
        <div class="wheel-header">RL <span class="wheel-sub">Traseira Esquerda</span></div>
        <div class="wheel-params">
          ${itemsMapper('REARLEFT')}
        </div>
      </div>
      <!-- RR -->
      <div class="wheel-card RR">
        <div class="wheel-header">RR <span class="wheel-sub">Traseira Direita</span></div>
        <div class="wheel-params">
          ${itemsMapper('REARRIGHT')}
        </div>
      </div>
    </div>`;

  return `
    <div class="setup-tabs-container animate-in" style="margin-bottom:var(--s5)">
      <div class="setup-tabs" role="tablist">
        <button class="setup-tab active" data-tab="elec" role="tab" aria-selected="true">⚡ Eletrônica & Freios</button>
        <button class="setup-tab" data-tab="aero" role="tab" aria-selected="false">🏎️ Aero & Pneus</button>
        <button class="setup-tab" data-tab="susp" role="tab" aria-selected="false">🛠️ Suspensão</button>
        <button class="setup-tab" data-tab="damp" role="tab" aria-selected="false">📈 Amortecedores</button>
        <button class="setup-tab" data-tab="trans" role="tab" aria-selected="false">⚙️ Transmissão</button>
      </div>

      <!-- Tab 1: Eletrônica & Freios -->
      <div class="setup-tab-content active" id="tab-elec" role="tabpanel">
        <div class="detail-card">
          <div class="detail-card-title">⚡ Controles Eletrônicos & Freios</div>
          <div class="param-items grid-2col">
            ${renderRow('Controle de Tração (TC)', getP('CONTROLS', 'TractionControlMapSetting'))}
            ${renderRow('TC Power Cut', getP('CONTROLS', 'TCPowerCutMapSetting'))}
            ${renderRow('TC Slip Angle', isLMP3 ? 'Linked' : getP('CONTROLS', 'TCSlipAngleMapSetting'))}
            ${hasABS ? renderRow('ABS', getP('CONTROLS', 'AntilockBrakeSystemMapSetting')) : ''}
            ${renderRow('Viés de Freio (Brake Bias)', getP('CONTROLS', 'RearBrakeSetting'))}
            ${renderRow('Brake Migration', getP('CONTROLS', 'BrakeMigrationSetting'))}
            ${renderRow('Pressão de Freio (Brake Pressure)', getP('CONTROLS', 'BrakePressureSetting'))}
            ${renderRow('Mistura de Combustível', getP('ENGINE', 'EngineMixtureSetting'))}
            ${renderRow('Limitador de Giros (Rev Limit)', getP('ENGINE', 'RevLimitSetting'))}
            ${renderRow('Mapa de Regeneração', getP('ENGINE', 'RegenerationMapSetting'))}
            ${renderRow('Mapa do Motor Elétrico', getP('ENGINE', 'ElectricMotorMapSetting'))}
          </div>
        </div>
      </div>

      <!-- Tab 2: Aero & Pneus -->
      <div class="setup-tab-content" id="tab-aero" style="display:none" role="tabpanel">
        <div class="detail-card" style="margin-bottom:var(--s4)">
          <div class="detail-card-title">✈️ Aerodinâmica Geral</div>
          <div class="param-items grid-2col">
            ${renderRow('Asa Traseira (Rear Wing)', getP('REARWING', 'RWSetting'))}
            ${renderRow('Asa Dianteira (Front Wing)', getP('FRONTWING', 'FWSetting'))}
            ${renderRow('Duto de Freio Dianteiro', getP('BODYAERO', 'BrakeDuctSetting'))}
            ${renderRow('Duto de Freio Traseiro', getP('BODYAERO', 'BrakeDuctRearSetting'))}
            ${renderRow('Radiador de Água', getP('BODYAERO', 'WaterRadiatorSetting'))}
            ${renderRow('Radiador de Óleo', getP('BODYAERO', 'OilRadiatorSetting'))}
            ${renderRow('Flares Paralama (Esquerdo)', getP('LEFTFENDER', 'FenderFlareSetting'))}
            ${renderRow('Flares Paralama (Direito)', getP('RIGHTFENDER', 'FenderFlareSetting'))}
          </div>
        </div>
        
        <div class="detail-card">
          ${renderWheelGrid('🎈 Pneus (Pressão & Composto)', wheel => `
            ${renderRow('Pressão', getP(wheel, 'PressureSetting'))}
            ${renderRow('Composto', getP(wheel, 'CompoundSetting'))}
            ${renderRow('Brake Disc', getP(wheel, 'BrakeDiscSetting'))}
            ${renderRow('Brake Pad', getP(wheel, 'BrakePadSetting'))}
          `)}
        </div>
      </div>

      <!-- Tab 3: Suspensão -->
      <div class="setup-tab-content" id="tab-susp" style="display:none" role="tabpanel">
        <div class="detail-card" style="margin-bottom:var(--s4)">
          <div class="detail-card-title">🛠️ Geometria de Suspensão Geral</div>
          <div class="param-items grid-2col">
            ${renderRow('Barra Dianteira (Front Anti-Sway)', getP('SUSPENSION', 'FrontAntiSwaySetting'))}
            ${renderRow('Barra Traseira (Rear Anti-Sway)', getP('SUSPENSION', 'RearAntiSwaySetting'))}
            ${renderRow('Toe Dianteiro (Front Toe-in)', getP('SUSPENSION', 'FrontToeInSetting'))}
            ${renderRow('Toe Traseiro (Rear Toe-in)', getP('SUSPENSION', 'RearToeInSetting'))}
          </div>
        </div>

        <div class="detail-card">
          ${renderWheelGrid('📐 Parâmetros de Suspensão por Roda', wheel => `
            ${renderRow('Altura (Ride Height)', getP(wheel, 'RideHeightSetting'))}
            ${renderRow('Cambagem (Camber)', getP(wheel, 'CamberSetting'))}
            ${renderRow('Mola (Spring)', getP(wheel, 'SpringSetting'))}
            ${renderRow('Tender Spring', getP(wheel, 'TenderSpringSetting'))}
            ${renderRow('Tender Travel', getP(wheel, 'TenderTravelSetting'))}
            ${renderRow('Packer', getP(wheel, 'PackerSetting'))}
          `)}
        </div>
      </div>

      <!-- Tab 4: Amortecedores -->
      <div class="setup-tab-content" id="tab-damp" style="display:none" role="tabpanel">
        <div class="detail-card">
          ${renderWheelGrid('📈 Configuração de Amortecedores (Dampers)', wheel => `
            ${renderRow('Bump Lento', getP(wheel, 'SlowBumpSetting'))}
            ${renderRow('Bump Rápido', getP(wheel, 'FastBumpSetting'))}
            ${renderRow('Rebound Lento', getP(wheel, 'SlowReboundSetting'))}
            ${renderRow('Rebound Rápido', getP(wheel, 'FastReboundSetting'))}
          `)}
        </div>
      </div>

      <!-- Tab 5: Transmissão -->
      <div class="setup-tab-content" id="tab-trans" style="display:none" role="tabpanel">
        <div class="detail-card">
          <div class="detail-card-title">⚙️ Transmissão &amp; Diferencial</div>
          <div class="param-items grid-2col">
            ${renderRow('Relação Final (Final Drive)', getP('DRIVELINE', 'FinalDriveSetting'))}
            ${renderRow('Ratio Set', getP('DRIVELINE', 'RatioSetSetting'))}
            ${renderRow('1ª Marcha', getP('DRIVELINE', 'Gear1Setting'))}
            ${renderRow('2ª Marcha', getP('DRIVELINE', 'Gear2Setting'))}
            ${renderRow('3ª Marcha', getP('DRIVELINE', 'Gear3Setting'))}
            ${renderRow('4ª Marcha', getP('DRIVELINE', 'Gear4Setting'))}
            ${renderRow('5ª Marcha', getP('DRIVELINE', 'Gear5Setting'))}
            ${renderRow('6ª Marcha', getP('DRIVELINE', 'Gear6Setting'))}
            ${renderRow('Ré (Reverse)', getP('DRIVELINE', 'ReverseSetting'))}
            ${renderRow('Diff Power', getP('DRIVELINE', 'DiffPowerSetting'))}
            ${renderRow('Diff Coast', getP('DRIVELINE', 'DiffCoastSetting'))}
            ${renderRow('Diff Preload', getP('DRIVELINE', 'DiffPreloadSetting'))}
          </div>
        </div>
      </div>
    </div>`;
}

// ── COMMENTS & FEEDBACKS LOGIC ─────────────────────────────
let currentComments = [];

async function loadAndRenderComments(setupId) {
  const root = document.getElementById('comments-section-root');
  if (!root) return;

  const isDbOnline = typeof supabaseClient !== 'undefined' && supabaseClient;
  
  if (!isDbOnline) {
    root.innerHTML = `
      <div class="detail-card card-with-header" style="margin-top:var(--s5); background:#08080eeb;">
        <div class="detail-card-title">💬 Feedbacks da Comunidade</div>
        <div class="detail-card-body">
          <div style="padding:var(--s4); background:rgba(232,0,45,0.05); border:1px solid rgba(232,0,45,0.15); border-radius:var(--r-md); text-align:center; color:var(--text-3); font-size:0.875rem;">
            ⚠️ O servidor de banco de dados está offline. Os feedbacks estão indisponíveis no momento.
          </div>
        </div>
      </div>
    `;
    return;
  }

  currentComments = await Storage.getComments(setupId);

  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  const currentUserId = isLoggedIn ? Auth.getUser()?.id : null;
  const isOwner = currentSetup && currentSetup.userId && currentSetup.userId === currentUserId;

  let commentsHtml = '';
  if (currentComments.length === 0) {
    commentsHtml = `<p class="notes-text empty" style="margin-bottom:var(--s4)">Nenhum feedback ainda. Seja o primeiro a comentar!</p>`;
  } else {
    commentsHtml = `
      <div class="comments-container">
        ${currentComments.map(c => {
          const initials = getInitials(c.username);
          const avatarColor = (typeof Auth !== 'undefined') ? Auth.getAvatarColor(c.username) : '#e8002d';
          
          let likedClass = '';
          if (isLoggedIn) {
            const likedComments = JSON.parse(localStorage.getItem(`liked_comments_${currentUserId}`) || '[]');
            if (likedComments.includes(c.id)) {
              likedClass = 'liked';
            }
          }
          
          return `
            <div class="comment-row" data-id="${c.id}">
              <div class="comment-avatar-col">
                <div class="avatar-small" style="background:${avatarColor}">${initials}</div>
              </div>
              <div class="comment-content-col">
                <div class="comment-header" style="margin-bottom: var(--s2); display: flex; justify-content: space-between; align-items: center;">
                  <div class="comment-author">${escapeHtml(c.username)}</div>
                  <div class="comment-header-right" style="display: flex; align-items: center; gap: var(--s4); padding-right: 6px;">
                    <span class="comment-time">${formatDateTime(c.createdAt)}</span>
                    <button type="button" class="btn-comment-like ${likedClass}" onclick="likeComment('${c.id}', event)">
                      👍 <span class="like-count">${c.likes || 0}</span>
                    </button>
                  </div>
                </div>
                <div class="comment-text">${escapeHtml(c.comment)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  let formHtml = '';
  if (isOwner) {
    formHtml = `
      <div style="margin-top:var(--s4); padding:var(--s4); background:rgba(255,255,255,0.02); border:1px dashed var(--border); border-radius:var(--r-md); text-align:center; font-size:0.875rem; color:var(--text-3)">
        📝 Como criador do setup, utilize o card "Comentários & Notas" (editando o setup) para adicionar observações.
      </div>
    `;
  } else {
    formHtml = `
      <div class="comment-form-wrap">
        <textarea class="comment-input-area" id="txt-new-comment" placeholder="Escreva seu feedback sobre o setup..."></textarea>
        <div class="comment-submit-row">
          <button type="button" class="btn btn-primary btn-sm" id="btn-submit-comment">Enviar Feedback</button>
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="detail-card card-with-header" style="margin-top:var(--s5); background:#08080eeb;">
      <div class="detail-card-title">💬 Feedbacks da Comunidade</div>
      <div class="detail-card-body">
        ${commentsHtml}
        ${formHtml}
      </div>
    </div>
  `;

  const btnSubmit = document.getElementById('btn-submit-comment');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async (e) => {
      if (e) e.preventDefault();
      const textarea = document.getElementById('txt-new-comment');
      const text = textarea ? textarea.value.trim() : '';
      if (!text) {
        showToast('Escreva um feedback primeiro.', 'error');
        return;
      }
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando...';
      try {
        await Storage.addComment(setupId, text);
        showToast('Feedback enviado com sucesso!', 'success');
        await loadAndRenderComments(setupId);
      } catch (err) {
        showToast(err.message || 'Erro ao enviar feedback.', 'error');
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Enviar Feedback';
      }
    });
  }
}

async function likeComment(commentId, event) {
  if (event) event.stopPropagation();

  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  if (!isLoggedIn) {
    showToast('Você precisa fazer login para curtir feedbacks.', 'error');
    return;
  }

  const userId = Auth.getUser()?.id || 'anon';
  const likedKey = `liked_comments_${userId}`;
  let liked = [];
  try {
    liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
  } catch (e) {
    liked = [];
  }

  const comment = currentComments.find(c => c.id === commentId);
  if (comment && comment.userId === userId) {
    showToast('Você não pode curtir seu próprio comentário.', 'error');
    return;
  }

  const alreadyLiked = liked.includes(commentId);
  const diff = alreadyLiked ? -1 : 1;

  try {
    await Storage.likeComment(commentId, diff);
    
    if (alreadyLiked) {
      liked = liked.filter(id => id !== commentId);
      showToast('Curtida removida.', 'error');
    } else {
      liked.push(commentId);
      showToast('Feedback curtido!', 'success');
    }
    localStorage.setItem(likedKey, JSON.stringify(liked));

    const btn = event.currentTarget || document.querySelector(`.comment-row[data-id="${commentId}"] .btn-comment-like`);
    if (btn) {
      btn.classList.toggle('liked', !alreadyLiked);
      const countEl = btn.querySelector('.like-count');
      if (countEl) {
        const currentCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = Math.max(currentCount + diff, 0);
      }
    }
  } catch (err) {
    showToast(err.message || 'Erro ao alterar curtida.', 'error');
  }
}
window.likeComment = likeComment;
