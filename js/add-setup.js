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
  bindSvmImport();
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
      // Se estiver vazio ou for apenas um sinal de menos/ponto, não atualizamos o slider ainda
      if (valEl.value === '' || isNaN(parseFloat(valEl.value))) return;
      
      const val = parseFloat(valEl.value);
      const min = parseFloat(slEl.min);
      const max = parseFloat(slEl.max);
      
      // Apenas movemos o slider e a barra se estiver dentro dos limites válidos
      if (val >= min && val <= max) {
        slEl.value = val;
        updateSliderTrack(slEl);
      }
    });

    // Quando o usuário sai do campo ou confirma o valor, fazemos o clamping oficial
    const clampValue = () => {
      let val = parseFloat(valEl.value);
      const min = parseFloat(slEl.min);
      const max = parseFloat(slEl.max);

      if (isNaN(val)) {
        val = parseFloat(slEl.value);
      } else {
        val = Math.min(max, Math.max(min, val));
      }
      
      slEl.value = val;
      valEl.value = val;
      updateSliderTrack(slEl);
    };

    valEl.addEventListener('blur', clampValue);
    valEl.addEventListener('change', clampValue);

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

  // Carrega campos do Setup Aberto
  document.getElementById('f-setup-type').value = setup.setupType || 'fixed';
  document.getElementById('f-car-version').value = setup.carVersion || '';
  window.importedOpenParams = setup.openParams || null;
  if (setup.setupType === 'open' && setup.openParams) {
    // Mostrar painel open com dados preenchidos
    fillOpenParamsPanel(setup.openParams);
    switchToOpenMode();
    document.getElementById('btn-import-svm').textContent = '📥 Reimportar Setup (.svm)';
  } else if (setup.setupType === 'open') {
    document.getElementById('btn-import-svm').textContent = '📥 Reimportar Setup (.svm)';
  }

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
      setupType:    document.getElementById('f-setup-type').value || 'fixed',
      carVersion:   document.getElementById('f-car-version').value || null,
    };

    // Se for setup open, capturar os dados editados do painel de abas
    if (data.setupType === 'open') {
      data.openParams = readOpenParamsFromPanel();
      // Extrair também os key params do painel open para o hero
      const ctrl = data.openParams['CONTROLS'] || {};
      if (ctrl['RearBrakeSetting']?.display) {
        const bbM = ctrl['RearBrakeSetting'].display.match(/^([\d.]+)/);
        if (bbM) data.brakeBias = parseFloat(bbM[1]);
      }
      if (ctrl['TractionControlMapSetting']?.display) data.tc = parseInt(ctrl['TractionControlMapSetting'].display);
      if (ctrl['TCPowerCutMapSetting']?.display) data.tcPowerCut = parseInt(ctrl['TCPowerCutMapSetting'].display);
      if (ctrl['TCSlipAngleMapSetting']?.display) data.tcSlipAngle = ctrl['TCSlipAngleMapSetting'].display.toLowerCase() === 'linked' ? 'Linked' : parseInt(ctrl['TCSlipAngleMapSetting'].display);
      if (ctrl['AntilockBrakeSystemMapSetting']?.display) {
        const absM = ctrl['AntilockBrakeSystemMapSetting'].display.match(/^(\d+)/);
        if (absM) data.abs = parseInt(absM[1]);
      }
      if (ctrl['BrakePressureSetting']?.display) {
        const bpM = ctrl['BrakePressureSetting'].display.match(/\((\d+)%\)/);
        if (bpM) data.brakePressure = parseInt(bpM[1]);
      }
    } else {
      data.openParams = null;
    }

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

// ── SVM IMPORT LOGIC ──────────────────────────────────────────
window.importedOpenParams = null;

function bindSvmImport() {
  const btn = document.getElementById('btn-import-svm');
  const fileInput = document.getElementById('svm-file-input');
  if (!btn || !fileInput) return;

  btn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svm')) {
      showToast('Apenas arquivos .svm são permitidos.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const text = evt.target.result;
        const parsed = parseSVM(text);

        if (!parsed.vehicleClassSetting) {
          showToast('Formato de arquivo .svm inválido ou vazio.', 'error');
          return;
        }

        // Auto-detect class and car
        const { classId, carId } = matchClassAndCar(parsed.vehicleClassSetting);
        if (classId) {
          selectClass(classId);
          setTimeout(() => {
            const carSel = document.getElementById('f-car');
            if (carId) {
              carSel.value = carId;
              populateYears(carId);
              setTimeout(() => {
                const yearSel = document.getElementById('f-year');
                if (yearSel.options.length > 1) yearSel.selectedIndex = 1;
              }, 50);
            }
          }, 50);
        }

        // Auto-detect version from //VEH= line
        let carVersion = '';
        const vehLine = text.split('\n').find(l => l.trim().startsWith('//VEH='));
        if (vehLine) {
          const match = vehLine.match(/[\/\\](\d+\.\d+)[\/\\][^\/\\]+\.VEH$/i);
          if (match) carVersion = match[1];
        }
        document.getElementById('f-car-version').value = carVersion;

        // Set notes if present
        if (parsed.notes) {
          document.getElementById('f-notes').value = parsed.notes;
        }

        // Parse key params for sliders
        const keyParams = extractKeyParams(parsed);

        if (parsed.setupType === 'fixed') {
          // ── FIXED SETUP ───────────────────────────────────
          document.getElementById('f-setup-type').value = 'fixed';
          window.importedOpenParams = null;

          if (keyParams.brakeBias != null)    updateParamVal('sl-bb',   'val-bb',   keyParams.brakeBias);
          if (keyParams.tc != null)           updateParamVal('sl-tc',   'val-tc',   keyParams.tc);
          if (keyParams.tcPowerCut != null)   updateParamVal('sl-tcpc', 'val-tcpc', keyParams.tcPowerCut);
          if (keyParams.abs != null)          updateParamVal('sl-abs',  'val-abs',  keyParams.abs);
          if (keyParams.brakePressure != null) updateParamVal('sl-bp',  'val-bp',   keyParams.brakePressure);
          if (keyParams.tcSlipAngle != null) {
            if (keyParams.tcSlipAngle === 'Linked') {
              document.getElementById('sl-tcsa').disabled = true;
              document.getElementById('val-tcsa').disabled = true;
              document.getElementById('val-tcsa').type = 'text';
              document.getElementById('val-tcsa').value = 'Linked';
            } else {
              updateParamVal('sl-tcsa', 'val-tcsa', keyParams.tcSlipAngle);
            }
          }

          switchToFixedMode();
          btn.textContent = '📥 Reimportar Setup (.svm)';
          openImportTrackModal(file.name, parsed.notes || '', 'fixed');

        } else {
          // ── OPEN SETUP ────────────────────────────────────
          document.getElementById('f-setup-type').value = 'open';
          window.importedOpenParams = parsed.sections;

          fillOpenParamsPanel(parsed.sections);
          switchToOpenMode();

          // Também atualizar sliders (para referência)
          if (keyParams.brakeBias != null)    updateParamVal('sl-bb',   'val-bb',   keyParams.brakeBias);
          if (keyParams.tc != null)           updateParamVal('sl-tc',   'val-tc',   keyParams.tc);
          if (keyParams.tcPowerCut != null)   updateParamVal('sl-tcpc', 'val-tcpc', keyParams.tcPowerCut);
          if (keyParams.abs != null)          updateParamVal('sl-abs',  'val-abs',  keyParams.abs);
          if (keyParams.brakePressure != null) updateParamVal('sl-bp',  'val-bp',   keyParams.brakePressure);

          btn.textContent = '📥 Reimportar Setup (.svm)';
          openImportTrackModal(file.name, parsed.notes || '', 'open');
        }

      } catch (err) {
        console.error(err);
        showToast('Erro ao processar arquivo .svm: ' + err.message, 'error');
      }

      fileInput.value = '';
    };

    reader.readAsText(file);
  });
}

function updateParamVal(sliderId, inputId, value) {
  const sl = document.getElementById(sliderId);
  const input = document.getElementById(inputId);
  if (sl && input) {
    sl.value = value;
    input.value = value;
    updateSliderTrack(sl);
  }
}

// Track confirmation modal logic
function openImportTrackModal(fileName, notesText, setupType) {
  const modal = document.getElementById('modal-import-track');
  const select = document.getElementById('import-track-select');
  if (!modal || !select) return;

  select.innerHTML = '<option value="">-- Escolha uma Pista --</option>';
  [...LMU_DATA.tracks]
    .sort((a, b) => a.shortName.localeCompare(b.shortName))
    .forEach(t => {
      select.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.flag} ${t.name}</option>`);
    });

  const detectedId = detectTrack(fileName, notesText);
  if (detectedId) select.value = detectedId;

  modal.style.display = 'flex';

  const cancelBtn = document.getElementById('btn-cancel-import-track');
  const confirmBtn = document.getElementById('btn-confirm-import-track');

  const close = () => { modal.style.display = 'none'; cleanup(); };

  const confirm = () => {
    const selectedTrackId = select.value;
    if (!selectedTrackId) {
      showToast('Por favor, selecione uma pista.', 'error');
      return;
    }
    document.getElementById('f-track').value = selectedTrackId;
    populateLayouts(selectedTrackId);
    const tipoLabel = (setupType === 'fixed') ? 'Fixo' : 'Aberto';
    showToast(`Setup ${tipoLabel} (.svm) importado! Revise os campos e clique em Salvar.`, 'success');
    close();
  };

  const cleanup = () => {
    cancelBtn.removeEventListener('click', close);
    confirmBtn.removeEventListener('click', confirm);
  };

  cancelBtn.addEventListener('click', close);
  confirmBtn.addEventListener('click', confirm);
}

// SVM Parser
function parseSVM(text) {
  const lines = text.split(/\r?\n/);
  const result = {
    vehicleClassSetting: '',
    notes: '',
    setupType: 'open', // default; será sobrescrito pela detecção abaixo
    sections: {}
  };

  let currentSection = '';

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Detectar tipo Fixed vs Open via cabeçalho "//Gear ratios="
    const gearRatiosMatch = line.match(/^\/\/Gear ratios=(\d+)/);
    if (gearRatiosMatch) {
      result.setupType = gearRatiosMatch[1] === '1' ? 'fixed' : 'open';
    }

    if (line.startsWith('VehicleClassSetting=')) {
      const match = line.match(/VehicleClassSetting="([^"]+)"/);
      if (match) {
        result.vehicleClassSetting = match[1];
      }
      continue;
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.substring(1, line.length - 1).toUpperCase();
      result.sections[currentSection] = {};
      continue;
    }

    if (line.includes('=') && !line.startsWith('//')) {
      const eqIdx = line.indexOf('=');
      const key = line.substring(0, eqIdx).trim();
      let valueWithComment = line.substring(eqIdx + 1).trim();

      if (key.toUpperCase() === 'NOTES') {
        let notesVal = valueWithComment;
        if (notesVal.startsWith('"') && notesVal.endsWith('"')) {
          notesVal = notesVal.substring(1, notesVal.length - 1);
        }
        if (notesVal.startsWith('NOTES=')) {
          notesVal = notesVal.substring(6);
        }
        result.notes = notesVal.replace(/\\n/g, '\n').trim();
        continue;
      }

      let rawVal = valueWithComment;
      let displayVal = '';
      if (valueWithComment.includes('//')) {
        const parts = valueWithComment.split('//');
        rawVal = parts[0].trim();
        displayVal = parts[1].trim();
      } else {
        displayVal = rawVal;
      }

      if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
        rawVal = rawVal.substring(1, rawVal.length - 1);
      }
      if (displayVal.startsWith('"') && displayVal.endsWith('"')) {
        displayVal = displayVal.substring(1, displayVal.length - 1);
      }

      if (currentSection) {
        result.sections[currentSection][key] = {
          raw: rawVal,
          display: displayVal
        };
      }
    }
  }

  return result;
}

// ── OPEN PARAMS PANEL HELPERS ─────────────────────────────────

// Preenche todos os inputs do painel de open setup com os dados de sections
function fillOpenParamsPanel(sections) {
  const inputs = document.querySelectorAll('#open-params-panel .open-param-input');
  inputs.forEach(input => {
    const section = input.dataset.section;
    const key = input.dataset.key;
    if (section && key && sections[section] && sections[section][key]) {
      input.value = sections[section][key].display || sections[section][key].raw || '';
    } else {
      input.value = '';
    }
  });
}

// Lê todos os inputs do painel e retorna um objeto sections atualizado
function readOpenParamsFromPanel() {
  const sections = JSON.parse(JSON.stringify(window.importedOpenParams || {}));
  const inputs = document.querySelectorAll('#open-params-panel .open-param-input');
  inputs.forEach(input => {
    const section = input.dataset.section;
    const key = input.dataset.key;
    if (section && key) {
      if (!sections[section]) sections[section] = {};
      if (!sections[section][key]) sections[section][key] = { raw: '', display: '' };
      sections[section][key].display = input.value;
      sections[section][key].raw = input.value;
    }
  });
  return sections;
}

// Mostra o painel open e oculta o card fixed (ou vice-versa)
function switchToOpenMode() {
  const fixedCard = document.querySelector('#param-list')?.closest('.form-card');
  const openPanel = document.getElementById('open-params-panel');
  if (fixedCard) fixedCard.style.display = 'none';
  if (openPanel) openPanel.style.display = 'block';

  // Bind das abas do painel open (previne listeners duplicados)
  const panel = document.getElementById('open-params-panel');
  if (panel && !panel._tabsBound) {
    panel._tabsBound = true;
    const tabs = panel.querySelectorAll('.setup-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        panel.querySelectorAll('.setup-tab-content').forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const contentId = `edit-tab-${tab.dataset.tab}`;
        const content = document.getElementById(contentId);
        if (content) { content.style.display = 'block'; content.classList.add('active'); }
      });
    });
  }
}

function switchToFixedMode() {
  const fixedCard = document.querySelector('#param-list')?.closest('.form-card');
  const openPanel = document.getElementById('open-params-panel');
  if (fixedCard) fixedCard.style.display = '';
  if (openPanel) openPanel.style.display = 'none';
}

// Extract Key parameters from parsed SVM
function extractKeyParams(parsed) {
  const controls = parsed.sections['CONTROLS'] || {};
  
  let brakeBias = null;
  let tc = null;
  let tcPowerCut = null;
  let tcSlipAngle = null;
  let abs = null;
  let brakePressure = null;

  // 1. Brake Bias
  if (controls['RearBrakeSetting']) {
    const display = controls['RearBrakeSetting'].display;
    if (display) {
      const match = display.match(/^([\d.]+)/);
      if (match) {
        brakeBias = parseFloat(match[1]);
      }
    }
  }

  // 2. TC
  if (controls['TractionControlMapSetting']) {
    tc = parseInt(controls['TractionControlMapSetting'].display);
  }

  // 3. TC Power Cut
  if (controls['TCPowerCutMapSetting']) {
    tcPowerCut = parseInt(controls['TCPowerCutMapSetting'].display);
  }

  // 4. TC Slip Angle
  if (controls['TCSlipAngleMapSetting']) {
    const display = controls['TCSlipAngleMapSetting'].display;
    if (display && display.toLowerCase() === 'linked') {
      tcSlipAngle = 'Linked';
    } else {
      tcSlipAngle = parseInt(display);
    }
  }

  // 5. ABS
  if (controls['AntilockBrakeSystemMapSetting']) {
    const display = controls['AntilockBrakeSystemMapSetting'].display;
    if (display) {
      const match = display.match(/^(\d+)/);
      if (match) {
        abs = parseInt(match[1]);
      }
    }
  }

  // 6. Brake Pressure
  if (controls['BrakePressureSetting']) {
    const display = controls['BrakePressureSetting'].display;
    if (display) {
      const match = display.match(/\((\d+)%\)/);
      if (match) {
        brakePressure = parseInt(match[1]);
      } else {
        const rawNum = parseInt(display);
        if (!isNaN(rawNum) && rawNum <= 100) {
          brakePressure = rawNum;
        }
      }
    }
  }

  return { brakeBias, tc, tcPowerCut, tcSlipAngle, abs, brakePressure };
}

// Heuristic Class & Car mapping
function matchClassAndCar(vehicleClassSetting) {
  const text = vehicleClassSetting.toLowerCase();
  let classId = '';
  let carId = '';
  
  if (text.includes('lmgt3') || text.includes('gt3')) {
    classId = 'lmgt3';
  } else if (text.includes('lmp2')) {
    classId = 'lmp2';
  } else if (text.includes('lmp3')) {
    classId = 'lmp3';
  } else if (text.includes('gte')) {
    classId = 'gte';
  } else if (text.includes('hypercar') || text.includes('lmh') || text.includes('lmdh') || text.includes('toyota_gr010') || text.includes('ferrari_499') || text.includes('porsche_963') || text.includes('cadillac') || text.includes('valkyrie')) {
    classId = 'hypercar';
  }
  
  if (classId === 'lmgt3') {
    if (text.includes('bmw') || text.includes('m4')) carId = 'bmw_m4_gt3';
    else if (text.includes('porsche') || text.includes('911') || text.includes('992')) carId = 'porsche_992_gt3';
    else if (text.includes('aston') || text.includes('vantage')) carId = 'aston_vantage_gt3';
    else if (text.includes('corvette') || text.includes('z06') || text.includes('c8.r')) carId = 'corvette_z06';
    else if (text.includes('ferrari') || text.includes('296')) carId = 'ferrari_296_gt3';
    else if (text.includes('ford') || text.includes('mustang')) carId = 'ford_mustang_gt3';
    else if (text.includes('lamborghini') || text.includes('huracan')) carId = 'lamborghini_evo2';
    else if (text.includes('lexus')) carId = 'lexus_rcf';
    else if (text.includes('mclaren') || text.includes('720s')) carId = 'mclaren_720s';
    else if (text.includes('mercedes') || text.includes('amg')) carId = 'mercedes_amg_gt3';
  } else if (classId === 'lmp2') {
    if (text.includes('oreca') || text.includes('07')) carId = 'oreca_07';
  } else if (classId === 'lmp3') {
    if (text.includes('ligier')) carId = 'ligier_p325';
    else if (text.includes('ginetta')) carId = 'ginetta_g61';
    else if (text.includes('duqueine')) carId = 'duqueine_d09';
  } else if (classId === 'gte') {
    if (text.includes('aston')) carId = 'aston_gte';
    else if (text.includes('corvette')) carId = 'corvette_gte';
    else if (text.includes('ferrari')) carId = 'ferrari_488_gte';
    else if (text.includes('porsche')) carId = 'porsche_rsr19';
  } else if (classId === 'hypercar') {
    if (text.includes('toyota')) carId = 'toyota_gr010';
    else if (text.includes('ferrari') || text.includes('499p')) carId = 'ferrari_499p';
    else if (text.includes('porsche') || text.includes('963')) carId = 'porsche_963';
    else if (text.includes('cadillac')) carId = 'cadillac_vseriesr';
    else if (text.includes('bmw') && text.includes('evo')) carId = 'bmw_m_hybrid_evo';
    else if (text.includes('bmw')) carId = 'bmw_m_hybrid_v8';
    else if (text.includes('alpine')) carId = 'alpine_a424';
    else if (text.includes('peugeot') && text.includes('2023')) carId = 'peugeot_9x8_23';
    else if (text.includes('peugeot')) carId = 'peugeot_9x8_24';
    else if (text.includes('glickenhaus')) carId = 'glickenhaus_007';
    else if (text.includes('vanwall')) carId = 'vanwall_680';
    else if (text.includes('isotta')) carId = 'isotta_tipo6';
    else if (text.includes('lamborghini')) carId = 'lamborghini_sc63';
    else if (text.includes('aston') || text.includes('valkyrie')) carId = 'aston_valkyrie';
    else if (text.includes('genesis')) carId = 'genesis_gmr001';
  }
  
  return { classId, carId };
}

// Guess Track ID from filename/notes
function detectTrack(fileName, notesText) {
  const combined = (fileName + " " + notesText).toLowerCase();
  
  if (combined.includes('sarthe') || combined.includes('le_mans') || combined.includes('le mans')) return 'le_mans';
  if (combined.includes('spa')) return 'spa';
  if (combined.includes('monza')) return 'monza';
  if (combined.includes('bahrain')) return 'bahrain';
  if (combined.includes('fuji')) return 'fuji';
  if (combined.includes('portimao') || combined.includes('portimão') || combined.includes('algarve')) return 'portimao';
  if (combined.includes('sebring')) return 'sebring';
  if (combined.includes('imola')) return 'imola';
  if (combined.includes('interlagos') || combined.includes('carlos pace') || combined.includes(' pace') || combined.includes('itl')) return 'interlagos';
  if (combined.includes('cota') || combined.includes('americas')) return 'cota';
  if (combined.includes('qatar') || combined.includes('lusail')) return 'qatar';
  if (combined.includes('silverstone')) return 'silverstone';
  if (combined.includes('ricard')) return 'paul_ricard';
  if (combined.includes('barcelona') || combined.includes('catalunya')) return 'barcelona';
  
  return '';
}

