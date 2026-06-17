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

  const actionsHtml = isOwner ? `
            <a href="add-setup.html?edit=${s.id}" class="btn btn-secondary btn-sm" title="Editar setup">
              ✏️ Editar
            </a>
            <button class="btn btn-danger btn-sm" id="btn-delete" title="Deletar setup">
              🗑 Deletar
            </button>
  ` : '';

  root.innerHTML = `
    <!-- HERO -->
    <section class="detail-hero animate-in">
      <div class="container">
        <div class="detail-hero-layout">
          
          <div class="detail-hero-actions">
            ${actionsHtml}
          </div>

          <div class="detail-hero-content">
            <div class="detail-badge-row">
              <span class="badge ${s.classId}">${clsName}</span>
              ${s.carYear ? `<span class="badge" style="background:var(--bg-overlay);color:var(--text-2);border:1px solid var(--border)">${s.carYear}</span>` : ''}
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
              <div class="detail-meta-item">
                <strong>Salvo em</strong>
                ${formatDateTime(s.createdAt)}
              </div>
              ${s.updatedAt && s.updatedAt !== s.createdAt ? `
              <div class="detail-meta-item">
                <strong>Atualizado</strong>
                ${formatDateTime(s.updatedAt)}
              </div>` : ''}
            </div>

          </div> <!-- /detail-hero-content -->

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
            <div class="detail-card" style="text-align:center">
              <div class="detail-card-title">⭐ Avaliação</div>
              <div class="rating-display" style="margin-top:var(--s2);justify-content:center">
                <div class="stars">
                  ${[1,2,3,4,5].map(i =>
                    `<span class="star ${i <= (s.rating||0) ? 'on' : ''}">★</span>`
                  ).join('')}
                </div>
                <span class="rating-text">${ratingLabel(s.rating)}</span>
              </div>
            </div>

            <!-- Quick params copy box -->
            <div class="detail-card" id="copy-box" style="text-align:center">
              <div class="detail-card-title">📋 Referência Rápida</div>
              <div style="font-family:var(--f-outfit);font-size:0.8125rem;line-height:2;color:#fff">
                <div>Brake Bias: <strong style="color:var(--text-1)">${formatBB(s.brakeBias)}</strong></div>
                <div>Traction Control: <strong style="color:var(--text-1)">${s.tc ?? '—'}</strong></div>
                <div>TC Power Cut: <strong style="color:var(--text-1)">${s.tcPowerCut ?? '—'}</strong></div>
                <div>TC Slip Angle: <strong style="color:var(--text-1)">${isLMP3 ? 'Linked' : (s.tcSlipAngle ?? '—')}</strong></div>
                ${hasABS ? `<div>ABS: <strong style="color:var(--text-1)">${s.abs ?? '—'}</strong></div>` : ''}
                <div>Brake Pressure: <strong style="color:var(--text-1)">${s.brakePressure ?? '—'}%</strong></div>
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
  sessionStorage.setItem('toast_type', 'info');
  window.location.href = 'index.html';
}

// ── HELPERS ───────────────────────────────────────────────────
function ratingLabel(r) {
  const labels = ['Sem avaliação', '😬 Horrível', '😕 Ruim', '🙂 OK', '😊 Bom', '🤩 Excelente'];
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
