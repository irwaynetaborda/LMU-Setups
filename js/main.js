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
    } else if (sortCol === 'setupType') {
      valA = a.setupType || 'fixed';
      valB = b.setupType || 'fixed';
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
  document.getElementById('stat-top-track').textContent = stats.topTrack;

  // Renderizar o mapa da pista mais usada no lado direito do card
  const topTrackMapContainer = document.getElementById('stat-top-track-map-container');
  if (topTrackMapContainer) {
    if (stats.topTrackId && stats.topTrackName) {
      // Normaliza o nome da pista da mesma forma que getTrackMapUrl no detail.js
      const TRACK_NAMES = [
        'Spa-Francorchamps', 'Le Mans', 'Bahrain', 'Fuji', 'Monza', 'Sebring', 
        'Portimao', 'Algarve', 'Imola', 'Interlagos', 'COTA', 'Silverstone', 'Lusail', 'Paul Ricard', 'Barcelona'
      ];
      let foundKey = 'default';
      const t = stats.topTrackName.toLowerCase();
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
      let fileName = foundKey.toLowerCase().replace(/\s+/g, '-');
      if (fileName === 'algarve') fileName = 'portimao';
      
      // Checa se há uma rotação correspondente
      let rotationClass = '';
      if (fileName === 'le-mans') rotationClass = 'sch-map-le-mans';
      else if (fileName === 'spa-francorchamps') rotationClass = 'sch-map-spa-francorchamps';
      else if (fileName === 'interlagos') rotationClass = 'sch-map-interlagos';
      else if (fileName === 'sebring') rotationClass = 'sch-map-sebring';

      topTrackMapContainer.innerHTML = `<img src="img/maps/${fileName}.png" class="stat-card-map-img ${rotationClass}" alt="Mapa de ${stats.topTrack}" onerror="this.parentElement.style.display='none'" />`;
      topTrackMapContainer.style.display = 'block';
    } else {
      topTrackMapContainer.style.display = 'none';
      topTrackMapContainer.innerHTML = '';
    }
  }

  // Renderizar logomarcas dos carros (Por Carro)
  const brandContainer = document.getElementById('brand-stats-container');
  if (brandContainer) {
    const allBrandIds = Object.keys(LMU_DATA.brands || {});
    // Ordenar para mostrar as marcas com setups primeiro (decrescente), depois as outras alfabeticamente
    allBrandIds.sort((a, b) => {
      const countA = stats.byBrand[a] || 0;
      const countB = stats.byBrand[b] || 0;
      if (countA !== countB) return countB - countA;
      const nameA = LMU_DATA.brands[a]?.name || a;
      const nameB = LMU_DATA.brands[b]?.name || b;
      return nameA.localeCompare(nameB);
    });

    brandContainer.innerHTML = allBrandIds.map(brandId => {
      const brand = LMU_DATA.brands[brandId];
      const count = stats.byBrand[brandId] || 0;
      const logoUrl = brand?.logo;
      const brandName = brand?.name || brandId;
      const logoHtml = logoUrl
        ? `<img src="${logoUrl}" class="stat-brand-logo" alt="${brandName}" title="${brandName}">`
        : `<span class="stat-brand-fallback">${brandName.charAt(0)}</span>`;
      return `
        <div class="stat-brand-item ${count > 0 ? 'active' : 'inactive'}" title="${brandName}: ${count} setups">
          ${logoHtml}
          <span class="stat-brand-count">${count}</span>
        </div>
      `;
    }).join('');
  }

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
            <th class="sortable th-creator" onclick="setSort('creator')">
              <div class="th-content">Criador <span class="sort-icon">${getSortIcon('creator')}</span></div>
            </th>
            <th class="sortable th-setup-type" onclick="setSort('setupType')">
              <div class="th-content">Setup <span class="sort-icon">${getSortIcon('setupType')}</span></div>
            </th>
            <th class="sortable th-class" onclick="setSort('class')">
              <div class="th-content">Classe <span class="sort-icon">${getSortIcon('class')}</span></div>
            </th>
            <th class="sortable th-car" onclick="setSort('car')">
              <div class="th-content">Carro <span class="sort-icon">${getSortIcon('car')}</span></div>
            </th>
            <th class="sortable th-track" onclick="setSort('track')">
              <div class="th-content">Pista <span class="sort-icon">${getSortIcon('track')}</span></div>
            </th>
            <th class="th-cond">
              <div class="th-content">Condição</div>
            </th>
            <th class="th-sess">
              <div class="th-content">Sessão</div>
            </th>
            <th class="sortable th-laptime" onclick="setSort('laptime')">
              <div class="th-content">Tempo <span class="sort-icon">${getSortIcon('laptime')}</span></div>
            </th>
            <th class="sortable th-date" onclick="setSort('date')">
              <div class="th-content">Data <span class="sort-icon">${getSortIcon('date')}</span></div>
            </th>
            <th class="sortable th-votes" onclick="setSort('votes')">
              <div class="th-content">Votos <span class="sort-icon">${getSortIcon('votes')}</span></div>
            </th>
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
  const sessLabel = sess ? sess.name : '—';
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

  // Verifica se o usuário já votou (apenas se estiver logado)
  let hasVoted = false;
  const isLoggedIn = (typeof Auth !== 'undefined') ? Auth.isAuthenticated() : false;
  if (isLoggedIn) {
    try {
      const userId = Auth.getUser()?.id || 'anon';
      const voted = JSON.parse(localStorage.getItem(`voted_setups_${userId}`) || '[]');
      hasVoted = voted.includes(s.id);
    } catch(e) {}
  }

  const creatorName = s.creatorUsername || 'Piloto';
  const initials = getInitials(creatorName);
  const avatarColor = (typeof Auth !== 'undefined') ? Auth.getAvatarColor(creatorName) : '#e8002d';
  const avatarHtml = `<div class="avatar-small" style="background:${avatarColor}">${initials}</div>`;

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
      <td><span class="badge-setup-type ${s.setupType || 'fixed'}">${(s.setupType || 'fixed') === 'open' ? 'Aberto' : 'Fixo'}</span></td>
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
      <td style="color:var(--text-3);font-size:0.8125rem;">${dateLabel}</td>
      <td onclick="event.stopPropagation()">
        <div class="cell-vote">
          <button class="btn-vote ${hasVoted ? 'voted' : ''}" onclick="voteSetup('${s.id}', event)" title="${hasVoted ? 'Você já votou' : 'Votar neste setup'}">
            <span class="star-icon">★</span>
            <span class="vote-count">${s.votes || 0}</span>
          </button>
        </div>
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
    sortDesc = (col === 'laptime' || col === 'car' || col === 'track' || col === 'class' || col === 'setupType') ? false : true; 
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
  showToast('Setup deletado.', 'error');
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
    // Retira o voto
    voted = voted.filter(x => x !== id);
    diff = -1;
  } else {
    // Adiciona o voto
    voted.push(id);
    diff = 1;
  }
  localStorage.setItem(votedKey, JSON.stringify(voted));

  // Incrementa/decrementa no estado local da UI
  const setup = allSetups.find(s => s.id === id);
  if (setup) {
    setup.votes = Math.max((setup.votes || 0) + diff, 0);
  }

  const newCount = setup ? setup.votes : 0;

  // Atualiza elemento visual imediatamente
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (row) {
    const btn = row.querySelector('.btn-vote');
    if (btn) {
      if (alreadyVoted) {
        btn.classList.remove('voted');
      } else {
        btn.classList.add('voted');
      }
      const countEl = btn.querySelector('.vote-count');
      if (countEl) {
        countEl.textContent = newCount;
      }
    }
  }

  // Persiste no banco usando RPC ou update
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const rpcName = diff > 0 ? 'increment_votes' : 'decrement_votes';
      const { error } = await supabaseClient.rpc(rpcName, { row_id: id });
      if (error) throw error;

      // Mantém o cache local atualizado caso fique offline posteriormente
      const allLocal = Storage._getAllLocal();
      const idx = allLocal.findIndex(s => s.id === id);
      if (idx !== -1) {
        allLocal[idx].votes = newCount;
        allLocal[idx].updatedAt = new Date().toISOString();
        Storage._persist(allLocal);
      }
    } catch (err) {
      console.error("[Supabase] Erro ao alterar voto:", err);
      // Fallback local update
      await Storage.update(id, { votes: newCount });
    }
  } else {
    // Fallback local update
    await Storage.update(id, { votes: newCount });
  }

  if (alreadyVoted) {
    showToast('Voto removido.', 'error');
  } else {
    showToast('Voto registrado! Obrigado.', 'success');
  }
}

window.getInitials = getInitials;
window.voteSetup = voteSetup;
