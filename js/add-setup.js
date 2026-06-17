// ============================================================
//  LMU SETUPS — add-setup.js
//  Lógica do formulário de novo setup / edição
// ============================================================

// ── STATE ─────────────────────────────────────────────────────
let editId   = null;
let rating   = 0;

// Pares slider ↔ campo numérico
const PARAMS = [
  { slider: 'sl-bb',   val: 'val-bb',   suffix: '%' },
  { slider: 'sl-tc',   val: 'val-tc',   suffix: ''  },
  { slider: 'sl-tcpc', val: 'val-tcpc', suffix: ''  },
  { slider: 'sl-tcsa', val: 'val-tcsa', suffix: ''  },
  { slider: 'sl-abs',  val: 'val-abs',  suffix: ''  },
  { slider: 'sl-bp',   val: 'val-bp',   suffix: '%' }
];

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildClassPicker();
  populateTracks();
  bindSliders();
  bindRating();
  setDefaultDate();
  checkEditMode();
  bindFormSubmit();
});

// ── CLASS PICKER ──────────────────────────────────────────────
function buildClassPicker() {
  const picker = document.getElementById('class-picker');
  picker.innerHTML = LMU_DATA.classes.map(c => `
    <button type="button"
      class="class-pick ${c.id}"
      data-class="${c.id}"
      aria-pressed="false">
      ${c.name}
    </button>`).join('');

  picker.querySelectorAll('.class-pick').forEach(btn => {
    btn.addEventListener('click', () => selectClass(btn.dataset.class));
  });
}

function selectClass(classId) {
  // Atualiza o campo oculto
  document.getElementById('f-class').value = classId;

  // Atualiza o estado visual
  document.querySelectorAll('.class-pick').forEach(b => {
    b.classList.toggle('selected', b.dataset.class === classId);
    b.setAttribute('aria-pressed', b.dataset.class === classId ? 'true' : 'false');
  });

  // Popula os carros
  populateCars(classId);

  // Alterna a exibição do ABS
  const hasABS = LMU_DATA.classHasABS(classId);
  document.getElementById('row-abs').classList.toggle('disabled', !hasABS);
  document.getElementById('sl-abs').disabled  = !hasABS;
  document.getElementById('val-abs').disabled = !hasABS;

  // Alterna o TC Slip Angle para LMP3
  const isLMP3 = classId === 'lmp3';
  const tcsaRow = document.getElementById('sl-tcsa').closest('.param-row');
  if (tcsaRow) tcsaRow.classList.toggle('disabled', isLMP3);
  document.getElementById('sl-tcsa').disabled  = isLMP3;
  document.getElementById('val-tcsa').disabled = isLMP3;
  if (isLMP3) {
    document.getElementById('val-tcsa').type = 'text';
    document.getElementById('val-tcsa').value = 'Linked';
  } else {
    document.getElementById('val-tcsa').type = 'number';
    document.getElementById('val-tcsa').value = document.getElementById('sl-tcsa').value;
  }
}

// ── CARS CASCADE ──────────────────────────────────────────────
function populateCars(classId) {
  const carSel  = document.getElementById('f-car');
  const yearSel = document.getElementById('f-year');

  carSel.innerHTML  = '<option value="">Selecione o carro</option>';
  yearSel.innerHTML = '<option value="">Selecione o carro primeiro</option>';
  carSel.disabled   = false;
  yearSel.disabled  = true;

  LMU_DATA.getCarsByClass(classId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(c => {
      carSel.insertAdjacentHTML('beforeend',
        `<option value="${c.id}">${c.name}</option>`);
    });
}

function populateYears(carId) {
  const yearSel = document.getElementById('f-year');
  const car     = LMU_DATA.getCarById(carId);
  yearSel.innerHTML = '<option value="">Selecione o ano</option>';
  yearSel.disabled  = !car;
  if (!car) return;
  [...car.years].reverse().forEach(y => {
    yearSel.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-car').addEventListener('change', e => {
    populateYears(e.target.value);
  });
});

// ── TRACKS CASCADE ────────────────────────────────────────────
function populateTracks() {
  const trackSel = document.getElementById('f-track');
  [...LMU_DATA.tracks]
    .sort((a, b) => a.shortName.localeCompare(b.shortName))
    .forEach(t => {
      trackSel.insertAdjacentHTML('beforeend',
        `<option value="${t.id}">${t.flag} ${t.name}</option>`);
    });

  trackSel.addEventListener('change', e => populateLayouts(e.target.value));
}

function populateLayouts(trackId) {
  const layoutSel = document.getElementById('f-layout');
  const track     = LMU_DATA.getTrackById(trackId);
  layoutSel.innerHTML = '<option value="">Selecione o layout</option>';
  layoutSel.disabled  = !track;
  if (!track) return;
  track.layouts.forEach(l => {
    layoutSel.insertAdjacentHTML('beforeend', `<option value="${l}">${l}</option>`);
  });
  if (track.layouts.length === 1) {
    layoutSel.value = track.layouts[0];
  }
}

// ── SLIDERS ───────────────────────────────────────────────────
function bindSliders() {
  PARAMS.forEach(({ slider, val }) => {
    const slEl  = document.getElementById(slider);
    const valEl = document.getElementById(val);

    // Controle deslizante → entrada numérica
    slEl.addEventListener('input', () => {
      valEl.value = slEl.value;
      updateSliderTrack(slEl);
    });

    // Entrada numérica → controle deslizante
    valEl.addEventListener('input', () => {
      const clamped = Math.min(
        parseFloat(slEl.max),
        Math.max(parseFloat(slEl.min), parseFloat(valEl.value) || parseFloat(slEl.min))
      );
      slEl.value  = clamped;
      valEl.value = clamped;
      updateSliderTrack(slEl);
    });

    updateSliderTrack(slEl);
  });
}

function updateSliderTrack(slEl) {
  const min = parseFloat(slEl.min);
  const max = parseFloat(slEl.max);
  const val = parseFloat(slEl.value);
  const pct = ((val - min) / (max - min)) * 100;
  slEl.style.background =
    `linear-gradient(to right, var(--red) ${pct}%, var(--bg-overlay) ${pct}%)`;
}

// ── RATING ────────────────────────────────────────────────────
function bindRating() {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach(star => {
    star.addEventListener('click', () => setRating(parseInt(star.dataset.val)));
    star.addEventListener('mouseenter', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseleave', () => highlightStars(rating));
  });
}

function setRating(val) {
  rating = val;
  document.getElementById('f-rating').value = val;
  highlightStars(val);
}

function highlightStars(upTo) {
  document.querySelectorAll('.rating-star').forEach(s => {
    s.classList.toggle('on', parseInt(s.dataset.val) <= upTo);
  });
}

// ── DEFAULT DATE ──────────────────────────────────────────────
function setDefaultDate() {
  const fDate = document.getElementById('f-date');
  if (!fDate) return;
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  fDate.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  fDate.addEventListener('click', () => {
    try { fDate.showPicker(); } catch (e) {}
  });
}

// ── EDIT MODE ─────────────────────────────────────────────────
async function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  editId = params.get('edit');
  if (!editId) return;

  const setup = await Storage.getById(editId);
  if (!setup) {
    window.location.href = 'index.html';
    return;
  }

  // Atualiza o título
  document.getElementById('form-title').innerHTML = 'Editar <em>Setup</em>';
  document.getElementById('form-subtitle').textContent = '';
  document.getElementById('btn-submit').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    Atualizar Setup`;

  // Preenche os campos
  selectClass(setup.classId);

  // Aguarda a atualização do DOM para setar valores dependentes
  setTimeout(() => {
    const carSel = document.getElementById('f-car');
    carSel.value = setup.carId;
    populateYears(setup.carId);

    setTimeout(() => {
      document.getElementById('f-year').value = setup.carYear;
    }, 50);
  }, 50);

  document.getElementById('f-track').value = setup.trackId;
  populateLayouts(setup.trackId);
  setTimeout(() => {
    document.getElementById('f-layout').value = setup.trackLayout;
  }, 50);

  document.getElementById('f-condition').value = setup.condition || '';
  document.getElementById('f-session').value   = setup.sessionType || '';
  document.getElementById('f-series').value    = setup.series || '';
  document.getElementById('f-laptime').value   = setup.laptime || '';
  document.getElementById('f-date').value      = setup.date || '';
  document.getElementById('f-notes').value     = setup.notes || '';
  document.getElementById('f-public').checked  = setup.isPublic !== false;

  // Parâmetros (Sliders e Valores numéricos)
  const paramMap = {
    'sl-bb':   setup.brakeBias,
    'sl-tc':   setup.tc,
    'sl-tcpc': setup.tcPowerCut,
    'sl-tcsa': setup.tcSlipAngle,
    'sl-abs':  setup.abs,
    'sl-bp':   setup.brakePressure
  };
  const valMap = {
    'val-bb':   setup.brakeBias,
    'val-tc':   setup.tc,
    'val-tcpc': setup.tcPowerCut,
    'val-tcsa': setup.tcSlipAngle,
    'val-abs':  setup.abs,
    'val-bp':   setup.brakePressure
  };

  Object.entries(paramMap).forEach(([id, val]) => {
    if (val != null) {
      const el = document.getElementById(id);
      el.value = val;
      updateSliderTrack(el);
    }
  });
  Object.entries(valMap).forEach(([id, val]) => {
    if (val != null) document.getElementById(id).value = val;
  });

  if (setup.rating) setRating(setup.rating);
}

// ── FORM SUBMIT ───────────────────────────────────────────────
function bindFormSubmit() {
  document.getElementById('setup-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      classId:      document.getElementById('f-class').value,
      carId:        document.getElementById('f-car').value,
      carYear:      document.getElementById('f-year').value,
      trackId:      document.getElementById('f-track').value,
      trackLayout:  document.getElementById('f-layout').value,
      condition:    document.getElementById('f-condition').value,
      sessionType:  document.getElementById('f-session').value,
      series:       document.getElementById('f-series').value,
      brakeBias:    parseFloat(document.getElementById('val-bb').value),
      tc:           parseInt(document.getElementById('val-tc').value),
      tcPowerCut:   parseInt(document.getElementById('val-tcpc').value),
      tcSlipAngle:  parseInt(document.getElementById('val-tcsa').value),
      abs:          parseInt(document.getElementById('val-abs').value),
      brakePressure:parseInt(document.getElementById('val-bp').value),
      laptime:      document.getElementById('f-laptime').value.trim(),
      date:         document.getElementById('f-date').value,
      rating,
      notes:        document.getElementById('f-notes').value.trim(),
      isPublic:     document.getElementById('f-public').checked,
    };

    if (editId) {
      await Storage.update(editId, data);
      showToast('Setup atualizado com sucesso!', 'success');
    } else {
      await Storage.save(data);
      showToast('Setup salvo com sucesso!', 'success');
    }
    
    // Desabilita o botão para não enviar duas vezes
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

// ── VALIDATION ────────────────────────────────────────────────
function validateForm() {
  const classId = document.getElementById('f-class').value;
  const carId   = document.getElementById('f-car').value;
  const carYear = document.getElementById('f-year').value;
  const trackId = document.getElementById('f-track').value;
  const layoutId= document.getElementById('f-layout').value;

  if (!classId)  { showToast('Selecione uma classe.', 'error'); return false; }
  if (!carId)    { showToast('Selecione um carro.', 'error'); return false; }
  if (!carYear)  { showToast('Selecione o ano do carro.', 'error'); return false; }
  if (!trackId)  { showToast('Selecione uma pista.', 'error'); return false; }
  if (!layoutId) { showToast('Selecione o layout da pista.', 'error'); return false; }
  
  return true;
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
