// ============================================================
//  LMU SETUPS — main.js
//  Lógica da página principal (index.html)
// ============================================================

// ── STATE ────────────────────────────────────────────────────
let allSetups = [];
let filtered  = [];
let sortCol   = 'date';
let sortDesc  = true;
let currentTab = 'public'; // 'public' ou 'private'

const filters = {
  classId:   '',
  carId:     '',
  trackId:   '',
  condition: '',
  session:   '',
  search:    '',
};

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateFilterDropdowns();
  loadAndRender();
  bindEvents();
  checkToast();
});

// ── POPULATE FILTER DROPDOWNS ─────────────────────────────────
function populateFilterDropdowns() {
  // Classes
  const fClass = document.getElementById('f-class');
  LMU_DATA.classes.forEach(c => {
    fClass.insertAdjacentHTML('beforeend',
      `<option value="${c.id}">${c.name}</option>`);
  });

  // Tracks
  const fTrack = document.getElementById('f-track');
  [...LMU_DATA.tracks]
    .sort((a, b) => a.shortName.localeCompare(b.shortName))
    .forEach(t => {
      fTrack.insertAdjacentHTML('beforeend',
        `<option value="${t.id}">${t.flag} ${t.shortName}</option>`);
    });
}

function populateCarFilter(classId) {
  const fCar = document.getElementById('f-car');
  fCar.innerHTML = '<option value="">Todos os Carros</option>';
  const cars = classId ? LMU_DATA.getCarsByClass(classId) : LMU_DATA.cars;
  cars
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(c => {
      fCar.insertAdjacentHTML('beforeend',
        `<option value="${c.id}">${c.name}</option>`);
    });
}

// ── LOAD & RENDER ─────────────────────────────────────────────
async function loadAndRender() {
  allSetups = await Storage.getAll();
  // Tenta popular seeds se for o primeiro acesso deste usuário
  if (typeof seedIfEmpty === 'function') await seedIfEmpty();
  // Recarrega após seeds para exibir os novos setups
  if (allSetups.length === 0) allSetups = await Storage.getAll();

  // Se não estiver logado, garante que a aba ativa seja a pública
  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  if (!isLoggedIn && currentTab === 'private') {
    currentTab = 'public';
    const tabs = document.querySelectorAll('.visibility-tab');
    tabs.forEach(t => {
      const isPublic = t.dataset.tab === 'public';
      t.classList.toggle('active', isPublic);
      t.setAttribute('aria-selected', isPublic ? 'true' : 'false');
    });
  }

  applyFilters();
  renderStats();
}

function applyFilters() {
  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  const currentUserId = isLoggedIn ? Auth.getUser()?.id : null;

  filtered = allSetups.filter(s => {
    // Filtro de Visibilidade (Público vs Meus Setups)
    if (currentTab === 'public') {
      if (s.isPublic === false) return false;
    } else if (currentTab === 'private') {
      if (!currentUserId || s.userId !== currentUserId) return false;
    }

    if (filters.classId   && s.classId   !== filters.classId)   return false;
    if (filters.carId     && s.carId     !== filters.carId)     return false;
    if (filters.trackId   && s.trackId   !== filters.trackId)   return false;
    if (filters.condition && s.condition !== filters.condition)  return false;
    if (filters.session   && s.sessionType !== filters.session)  return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const car   = LMU_DATA.getCarById(s.carId);
      const track = LMU_DATA.getTrackById(s.trackId);
      const hay = [
        car?.name, track?.name, track?.shortName,
        s.notes, s.carYear,
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Aplica ordenação
  filtered.sort((a, b) => {
    let valA, valB;
    if (sortCol === 'class') {
      valA = LMU_DATA.getClassById(a.classId)?.name || '';
      valB = LMU_DATA.getClassById(b.classId)?.name || '';
    } else if (sortCol === 'car') {
      valA = LMU_DATA.getCarById(a.carId)?.name || '';
      valB = LMU_DATA.getCarById(b.carId)?.name || '';
    } else if (sortCol === 'track') {
      valA = LMU_DATA.getTrackById(a.trackId)?.shortName || '';
      valB = LMU_DATA.getTrackById(b.trackId)?.shortName || '';
    } else if (sortCol === 'laptime') {
      valA = parseLaptimeToMs(a.laptime);
      valB = parseLaptimeToMs(b.laptime);
    } else if (sortCol === 'rating') {
      valA = a.rating || 0;
      valB = b.rating || 0;
    } else if (sortCol === 'date') {
      valA = new Date(a.date || 0).getTime();
      valB = new Date(b.date || 0).getTime();
    } else if (sortCol === 'creator') {
      valA = a.creatorUsername || '';
      valB = b.creatorUsername || '';
    } else if (sortCol === 'votes') {
      valA = a.votes || 0;
      valB = b.votes || 0;
    }
    
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  renderTable();
  updateCount();
}

// ── RENDER STATS ──────────────────────────────────────────────
function renderStats() {
  const stats = Storage.getStats(allSetups);

  document.getElementById('stat-total').textContent   = stats.total;
  document.getElementById('stat-rating').textContent  = stats.avgRating;
  document.getElementById('stat-top-track').textContent = stats.topTrack;

  // Barras de categoria
  const barsEl = document.getElementById('class-bars');
  const max = Math.max(...Object.values(stats.byClass), 1);
  barsEl.innerHTML = LMU_DATA.classes.map(c => {
    const count = stats.byClass[c.id] || 0;
    const pct   = ((count / max) * 100).toFixed(1);
    return `
      <div class="class-bar-row">
        <span class="lbl" style="color:${c.color}">${c.name}</span>
        <div class="class-bar-track">
          <div class="class-bar-fill" style="width:${pct}%;background:${c.color}"></div>
        </div>
        <span class="cnt">${count}</span>
      </div>`;
  }).join('');
}

// ── RENDER TABLE ──────────────────────────────────────────────
function renderTable() {
  const container = document.getElementById('setups-container');

  if (filtered.length === 0) {
    container.innerHTML = renderEmpty();
    return;
  }

  const rows = filtered.map((s, i) => renderRow(s, i)).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table class="setups-table" role="grid" aria-label="Lista de setups">
        <thead>
          <tr>
            <th class="sortable" onclick="setSort('creator')">Criador <span class="sort-icon">${getSortIcon('creator')}</span></th>
            <th class="sortable" onclick="setSort('class')">Classe <span class="sort-icon">${getSortIcon('class')}</span></th>
            <th class="sortable" onclick="setSort('car')">Carro <span class="sort-icon">${getSortIcon('car')}</span></th>
            <th class="sortable" onclick="setSort('track')">Pista <span class="sort-icon">${getSortIcon('track')}</span></th>
            <th>Condição</th>
            <th>Sessão</th>
            <th class="sortable" onclick="setSort('laptime')">Tempo <span class="sort-icon">${getSortIcon('laptime')}</span></th>
            <th class="sortable" onclick="setSort('rating')">Nota <span class="sort-icon">${getSortIcon('rating')}</span></th>
            <th class="sortable" onclick="setSort('date')">Data <span class="sort-icon">${getSortIcon('date')}</span></th>
            <th class="sortable" onclick="setSort('votes')">Votos <span class="sort-icon">${getSortIcon('votes')}</span></th>
          </tr>
        </thead>
        <tbody id="table-body">
          ${rows}
        </tbody>
      </table>
    </div>`;
}

function renderRow(s, index) {
  const car   = LMU_DATA.getCarById(s.carId);
  const track = LMU_DATA.getTrackById(s.trackId);
  const cls   = LMU_DATA.getClassById(s.classId);
  const cond  = LMU_DATA.conditions.find(c => c.id === s.condition);
  const sess  = LMU_DATA.sessionTypes.find(t => t.id === s.sessionType);

  const brand = car && car.brand ? LMU_DATA.brands[car.brand] : null;

  const carName   = car?.name   || s.carId   || '—';
  const trackName = track?.shortName || s.trackId || '—';
  const clsName   = cls?.name   || s.classId || '—';
  const condLabel = cond ? `${cond.icon} ${cond.name}` : '—';
  const sessLabel = sess ? `${sess.icon} ${sess.name}` : '—';
  const dateLabel = s.date ? formatDate(s.date) : '—';

  let logoHtml = '';
  if (brand) {
    if (brand.logo) {
      logoHtml = `<img src="${brand.logo}" class="car-logo" alt="${brand.name}" title="${brand.name}">`;
    } else {
      logoHtml = `<div class="car-logo-fallback" title="${brand.name}">${brand.short || brand.name.charAt(0)}</div>`;
    }
  } else {
    logoHtml = `<div class="car-logo-fallback">?</div>`;
  }

  // Verifica se o usuário já votou
  let hasVoted = false;
  try {
    const voted = JSON.parse(localStorage.getItem('voted_setups') || '[]');
    hasVoted = voted.includes(s.id);
  } catch(e) {}

  const creatorName = s.creatorUsername || 'Piloto';
  const initials = getInitials(creatorName);
  const avatarHtml = `<div class="avatar-small">${initials}</div>`;

  const style = `animation-delay:${index * 40}ms`;

  return `
    <tr class="animate-in" style="${style}"
        onclick="viewSetup('${s.id}')"
        data-id="${s.id}"
        role="row">
      <td>
        <div class="cell-creator">
          ${avatarHtml}
          <span class="creator-name">${creatorName}</span>
        </div>
      </td>
      <td><span class="badge ${s.classId}">${clsName}</span></td>
      <td>
        <div class="cell-car">
          ${logoHtml}
          <div class="cell-car-info">
            <span class="car-name">${carName}</span>
            <span class="car-year">${s.carYear || ''}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="cell-track">
          <span class="track-name">${track?.flag || ''} ${trackName}</span>
          <span class="track-layout">${s.trackLayout || ''}</span>
        </div>
      </td>
      <td><span class="cond-cell">${condLabel}</span></td>
      <td><span class="cond-cell">${sessLabel}</span></td>
      <td>
        <span class="laptime-cell ${!s.laptime ? 'empty' : ''}">
          ${s.laptime || 'Sem tempo'}
        </span>
      </td>
      <td>${renderStars(s.rating || 0)}</td>
      <td style="color:var(--text-3);font-size:0.8125rem;">${dateLabel}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn-vote ${hasVoted ? 'voted' : ''}" onclick="voteSetup('${s.id}', event)" title="${hasVoted ? 'Você já votou' : 'Votar neste setup'}">
          <span class="star-icon">★</span>
          <span class="vote-count">${s.votes || 0}</span>
        </button>
      </td>
    </tr>`;
}

function renderEmpty() {
  const hasFilters = Object.values(filters).some(v => v !== '');
  return `
    <div class="empty-state animate-in">
      <div class="icon">🏎️</div>
      <h3>${hasFilters ? 'Nenhum setup encontrado' : 'Nenhum setup ainda'}</h3>
      <p>${hasFilters
        ? 'Tente remover alguns filtros para ver mais resultados.'
        : 'Adicione seu primeiro setup antes de uma corrida e consulte sempre que precisar!'
      }</p>
      ${!hasFilters
        ? `<a href="add-setup.html" class="btn btn-primary">+ Adicionar Setup</a>`
        : `<button class="btn btn-ghost" onclick="resetFilters()">Limpar filtros</button>`
      }
    </div>`;
}

// ── STARS HELPER ──────────────────────────────────────────────
function renderStars(rating) {
  return `<div class="stars" aria-label="${rating} estrelas de 5">
    ${[1,2,3,4,5].map(i => `<span class="star ${i <= rating ? 'on' : ''}">★</span>`).join('')}
  </div>`;
}

// ── COUNT ─────────────────────────────────────────────────────
function updateCount() {
  const el = document.getElementById('setups-count');
  el.textContent = `${filtered.length} setup${filtered.length !== 1 ? 's' : ''}`;
}

// ── FORMAT DATE ───────────────────────────────────────────────
function formatDate(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

// ── SORTING HELPER ────────────────────────────────────────────
function parseLaptimeToMs(str) {
  if (!str) return 999999999;
  try {
    const parts = str.split(':');
    if (parts.length === 1) return parseFloat(parts[0]) * 1000;
    const min = parseInt(parts[0]);
    const sec = parseFloat(parts[1]);
    return ((min * 60) + sec) * 1000;
  } catch(e) {
    return 999999999;
  }
}

window.setSort = function(col) {
  if (sortCol === col) {
    sortDesc = !sortDesc;
  } else {
    sortCol = col;
    sortDesc = (col === 'laptime' || col === 'car' || col === 'track' || col === 'class') ? false : true; 
  }
  applyFilters();
}

window.getSortIcon = function(col) {
  if (sortCol !== col) return '<span style="opacity:0.2">↕</span>';
  return sortDesc ? '↓' : '↑';
}

// ── ACTIONS ───────────────────────────────────────────────────
function viewSetup(id) {
  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  if (!isLoggedIn) {
    showToast('Você precisa fazer login para visualizar os detalhes do setup.', 'error');
    if (typeof Auth !== 'undefined') Auth.openModal();
    return;
  }
  window.location.href = `setup-detail.html?id=${id}`;
}

function editSetup(id) {
  window.location.href = `add-setup.html?edit=${id}`;
}

async function deleteSetup(id, event) {
  event.stopPropagation();
  if (!confirm('Deletar este setup? Esta ação não pode ser desfeita.')) return;
  await Storage.delete(id);
  showToast('Setup deletado.', 'info');
  await loadAndRender();
}

function resetFilters() {
  filters.classId = filters.carId = filters.trackId =
  filters.condition = filters.session = filters.search = '';

  document.getElementById('f-class').value     = '';
  document.getElementById('f-car').value       = '';
  document.getElementById('f-track').value     = '';
  document.getElementById('f-condition').value = '';
  document.getElementById('f-session').value   = '';
  document.getElementById('f-search').value    = '';

  populateCarFilter('');
  applyFilters();
}

// ── BIND EVENTS ───────────────────────────────────────────────
function bindEvents() {
  document.getElementById('f-class').addEventListener('change', e => {
    filters.classId = e.target.value;
    populateCarFilter(filters.classId);
    filters.carId = '';
    document.getElementById('f-car').value = '';
    applyFilters();
  });

  document.getElementById('f-car').addEventListener('change', e => {
    filters.carId = e.target.value;
    applyFilters();
  });

  document.getElementById('f-track').addEventListener('change', e => {
    filters.trackId = e.target.value;
    applyFilters();
  });

  document.getElementById('f-condition').addEventListener('change', e => {
    filters.condition = e.target.value;
    applyFilters();
  });

  document.getElementById('f-session').addEventListener('change', e => {
    filters.session = e.target.value;
    applyFilters();
  });

  // Busca com debounce (atraso para otimização)
  let searchTimer;
  document.getElementById('f-search').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.search = e.target.value.trim();
      applyFilters();
    }, 300);
  });

  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

  // Abas de visibilidade
  const tabs = document.querySelectorAll('.visibility-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const isPrivateTab = tab.dataset.tab === 'private';
      const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
      
      if (isPrivateTab && !isLoggedIn) {
        showToast('Faça login para ver seus setups privados.', 'error');
        if (typeof Auth !== 'undefined') Auth.openModal();
        return;
      }
      
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      
      currentTab = tab.dataset.tab;
      applyFilters();
    });
  });
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

// ── CHECK TOAST FROM REDIRECT ─────────────────────────────────
function checkToast() {
  const msg = sessionStorage.getItem('toast_msg');
  const type = sessionStorage.getItem('toast_type');
  if (msg) {
    showToast(msg, type || 'success');
    sessionStorage.removeItem('toast_msg');
    sessionStorage.removeItem('toast_type');
  }
}

// ── VOTAÇÃO E AVATAR HELPERS ──────────────────────────────────
function getInitials(username) {
  if (!username) return '?';
  const parts = username.split(/[._-]/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || username[0].toUpperCase();
}

async function voteSetup(id, event) {
  if (event) event.stopPropagation();

  let voted = [];
  try {
    voted = JSON.parse(localStorage.getItem('voted_setups') || '[]');
  } catch (e) {
    voted = [];
  }

  if (voted.includes(id)) {
    showToast('Você já votou neste setup!', 'info');
    return;
  }

  voted.push(id);
  localStorage.setItem('voted_setups', JSON.stringify(voted));

  // Incrementa no estado local da UI
  const setup = allSetups.find(s => s.id === id);
  if (setup) {
    setup.votes = (setup.votes || 0) + 1;
  }
  const filteredSetup = filtered.find(s => s.id === id);
  if (filteredSetup) {
    filteredSetup.votes = (filteredSetup.votes || 0) + 1;
  }

  // Atualiza elemento visual imediatamente
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (row) {
    const btn = row.querySelector('.btn-vote');
    if (btn) {
      btn.classList.add('voted');
      const countEl = btn.querySelector('.vote-count');
      if (countEl) {
        countEl.textContent = setup ? setup.votes : (parseInt(countEl.textContent) || 0) + 1;
      }
    }
  }

  // Persiste no banco usando RPC
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { error } = await supabaseClient.rpc('increment_votes', { row_id: id });
      if (error) throw error;
    } catch (err) {
      console.error("[Supabase] Erro ao incrementar voto:", err);
      // Fallback local update
      await Storage.update(id, { votes: setup ? setup.votes : 1 });
    }
  } else {
    // Fallback local update
    await Storage.update(id, { votes: setup ? setup.votes : 1 });
  }

  showToast('Voto registrado! Obrigado.', 'success');
}

window.getInitials = getInitials;
window.voteSetup = voteSetup;
