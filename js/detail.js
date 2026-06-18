// ============================================================
//  LMU SETUPS — detail.js
//  Lógica da página de detalhe (setup-detail.html)
// ============================================================

let currentSetup = null;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { redirect(); return; }

  currentSetup = await Storage.getById(id);
  if (!currentSetup) { redirect(); return; }

  document.title = buildTitle(currentSetup) + ' — Taborda Setups';

  renderDetail(currentSetup);
  bindModal();
});

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
  const isOwner = s.userId && s.userId === currentUserId;

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

  const actionsHtml = isOwner ? `
            <a href="add-setup.html?edit=${s.id}" class="btn btn-secondary btn-sm" title="Editar setup">
              ✏️ Editar
            </a>
            <button class="btn btn-danger btn-sm" id="btn-delete" title="Deletar setup">
              🗑 Deletar
            </button>
  ` : '';

  const creatorName = s.creatorUsername || 'Piloto';
  const initials = getInitials(creatorName);
  const trackMapUrl = getTrackMapUrl(trackName);

  root.innerHTML = `
    <!-- HERO -->
    <section class="detail-hero animate-in">
      <div class="container">
        <div class="detail-hero-layout">

          <div class="detail-hero-content">
            <div class="detail-badge-row">
              <span class="badge ${s.classId}">${clsName}</span>
              ${s.carYear ? `<span class="badge" style="background:var(--bg-overlay);color:var(--text-2);border:1px solid var(--border)">${s.carYear}</span>` : ''}
              <div class="detail-creator-chip" title="Criador do setup">
                <div class="avatar-small">${initials}</div>
                <span>Criador: <strong>${creatorName}</strong></span>
              </div>
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
              ${track?.flag || ''} ${trackName}${s.trackLayout ? ` — ${s.trackLayout}` : ''}
            </p>

            <div class="detail-tags">
              ${cond  ? `<span class="detail-tag">${cond.icon}  ${cond.name}</span>`   : ''}
              ${sess  ? `<span class="detail-tag">${sess.icon}  ${sess.name}</span>`   : ''}
              ${series? `<span class="detail-tag">🏆 ${series.name}</span>`            : ''}
            </div>

            <div class="detail-meta">
              <div class="detail-meta-item">
                <strong>Data</strong>
                ${s.date ? formatDate(s.date) : '—'}
              </div>
            </div>

          </div> <!-- /detail-hero-content -->

          <!-- Sidebar container for actions & reference -->
          <div class="detail-hero-sidebar">
            ${actionsHtml ? `<div class="detail-hero-actions">${actionsHtml}</div>` : ''}
            
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
            <div class="detail-card" style="margin-bottom:var(--s5)">
              <div class="detail-card-title">⚙️ Parâmetros Fixed Setup</div>
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

            <!-- Notes -->
            <div class="detail-card">
              <div class="detail-card-title">📝 Comentários &amp; Notas</div>
              ${s.notes
                ? `<p class="notes-text">${escapeHtml(s.notes)}</p>`
                : `<p class="notes-text empty">Nenhum comentário adicionado.</p>`
              }
            </div>
          </div>

          <!-- Right: Laptime + Rating -->
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

          </div>
        </div>
      </div>
    </section>`;

  // Bind buttons
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) btnDelete.addEventListener('click', () => openModal());

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
  return `${Number(val).toFixed(1)}:${rear}`;
}

function renderParamItem(label, value, min, max, isPercent = false, isBB = false) {
  if (value == null) return '';
  const pct = Math.round(((value - min) / (max - min)) * 100);
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
