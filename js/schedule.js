// ============================================================
//  LMU SETUPS — schedule.js
//  Lógica da página de Corridas Diárias
// ============================================================

let currentSchedule = SCHEDULE_DATA;

document.addEventListener('DOMContentLoaded', () => {
  const customData = localStorage.getItem('lmu_custom_schedule');
  if (customData) {
    try {
      currentSchedule = JSON.parse(customData);
    } catch (e) {
      console.error(e);
    }
  }

  document.getElementById('schedule-subtitle').textContent = 
    `Le Mans Ultimate Online Championships — ${currentSchedule.season || 'Custom'} (from ${currentSchedule.dateFrom || 'N/A'})`;

  renderCards('daily', 'pane-daily');
  renderCards('weekly', 'pane-weekly');

  // Tabs
  const tabs = document.querySelectorAll('.schedule-tab');
  const panes = document.querySelectorAll('.schedule-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // Set active
      tab.classList.add('active');
      document.getElementById('pane-' + tab.dataset.tab).classList.add('active');
    });
  });
});

function renderCards(type, containerId) {
  const container = document.getElementById(containerId);
  const data = currentSchedule[type] || [];

  if (data.length === 0) {
    container.innerHTML = '<p style="color:var(--text-3);text-align:center">No events scheduled.</p>';
    return;
  }

  container.innerHTML = data.map((item, index) => {
    const delay = index * 50;
    
    // Classes badges
    const classBadges = item.classes.map(c => `<span class="sch-badge sch-class-${c.toLowerCase()}">${c}</span>`).join('');

    return `
      <div class="sch-card ${item.theme} animate-in" style="animation-delay:${delay}ms">
        <div class="sch-header">
          <div class="sch-badges">
            <span class="sch-badge sch-sr sch-sr-${item.sr.toLowerCase()}">SR ${item.sr}</span>
            ${classBadges}
          </div>
        </div>

        <div class="sch-body">
          <h2 class="sch-title">${item.title}</h2>
          <div class="sch-track">${item.track}</div>
          <div class="sch-starts">${item.frequency}</div>
          
          <div class="sch-map-placeholder">
            ${getTrackMap(item.track)}
          </div>
          
          ${item.times ? `<div class="sch-times">${item.times}</div>` : ''}
        </div>

        <div class="sch-footer">
          <div class="sch-stat">
            <span class="sch-stat-lbl">Circuit Length</span>
            <span class="sch-stat-val">${getTrackLength(item.track)}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Setup</span>
            <span class="sch-stat-val">${item.setup}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Event Length</span>
            <span class="sch-stat-val">${item.duration}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Driver Swaps</span>
            <span class="sch-stat-val">NONE</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Fuel Multiplier</span>
            <span class="sch-stat-val">${item.fuel || '100%'}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Tyre Wear</span>
            <span class="sch-stat-val">${item.tyresLimit || '100%'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── IMPORTADOR DE SCHEDULE ─────────────────────────────────────
window.openImportModal = function() {
  document.getElementById('import-modal').style.display = 'flex';
};
window.closeImportModal = function() {
  document.getElementById('import-modal').style.display = 'none';
};

window.clearImport = function() {
  if (confirm("Tem certeza que deseja apagar os dados importados e restaurar as corridas padrão?")) {
    localStorage.removeItem('lmu_custom_schedule');
    window.location.reload();
  }
};

function processImport() {
  const text = document.getElementById('import-text').value;
  if (!text) return alert("Cole o texto do cronograma.");

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const custom = {
    season: "Imported Schedule",
    dateFrom: new Date().toLocaleDateString(),
    daily: [],
    weekly: []
  };

  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar Season Header
    if (line.toLowerCase().includes("season") && line.toLowerCase().includes("runs from")) {
      const parts = line.split("runs from:");
      if (parts.length > 1) {
        custom.dateFrom = parts[1].split(',')[0].trim();
      }
      continue;
    }

    // ==== FORMATO DAILY RACES ====
    if (line.match(/[\[\(]([A-Za-z0-9]+)\s*SR[\]\)]/i) || line.toLowerCase().includes('beginner') || line.toLowerCase().includes('intermediate') || line.toLowerCase().includes('advanced')) {
      let sr = "BRONZE";
      if (line.toLowerCase().includes('silver')) sr = "SILVER";
      if (line.toLowerCase().includes('gold')) sr = "GOLD";
      const m = line.match(/[\[\(]([A-Za-z0-9]+)\s*SR[\]\)]/i);
      if (m) sr = m[1].toUpperCase();

      let theme = 'theme-bronze';
      if (sr.includes('SILVER') || sr.includes('S')) theme = 'theme-silver';
      if (sr.includes('GOLD') || sr.includes('G')) theme = 'theme-gold';

      currentBlock = { type: 'daily', sr, theme, frequency: "", duration: "", setup: "Fixed", tyreLimit: "N/A", assists: "Standard", warmers: "N/A" };
      continue;
    }

    if (currentBlock && currentBlock.type === 'daily' && line.toLowerCase().includes('starts every')) {
      currentBlock.frequency = (line.match(/starts every [^,]+/i) || [""])[0];
      const dur = line.match(/([0-9]+)m races/i);
      if (dur) currentBlock.duration = dur[1] + " Min";
      if (line.toLowerCase().includes('open setup')) currentBlock.setup = "Open";
      
      const tyres = line.match(/tyres:\s*([0-9]+)/i);
      if (tyres) currentBlock.tyreLimit = tyres[1];

      if (line.toLowerCase().includes('tyre warmers enabled')) currentBlock.warmers = 'Yes';
      if (line.toLowerCase().includes('no tyre warmers')) currentBlock.warmers = 'No';
      if (line.toLowerCase().includes('high assists')) currentBlock.assists = 'High';
      if (line.toLowerCase().includes('no assists')) currentBlock.assists = 'None';
      continue;
    }

    if (currentBlock && currentBlock.type === 'daily' && line.includes(':') && !line.toLowerCase().startsWith('week')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const titleParts = parts[0].split(' ');
        const classArray = titleParts[0].split('&').map(c => c.trim());
        let track = parts[1].split(',')[0].trim();

        custom.daily.push({
          title: parts[0].trim(),
          track: track,
          sr: currentBlock.sr,
          theme: currentBlock.theme,
          classes: classArray,
          frequency: currentBlock.frequency,
          duration: currentBlock.duration || "20 Min",
          setup: currentBlock.setup,
          fuel: "1x",
          tyresLimit: currentBlock.tyreLimit,
          assists: currentBlock.assists,
          warmers: currentBlock.warmers
        });
      }
      continue;
    }

    // ==== FORMATO WEEKLY RACES ====
    if (!line.includes(':') && !line.includes('|') && line.length > 5 && line.length < 50 && !line.toLowerCase().startsWith('week') && !line.toLowerCase().startsWith('attempts') && !line.toLowerCase().startsWith('drop')) {
      currentBlock = {
        type: 'weekly',
        title: line,
        sr: "BRONZE", theme: "theme-bronze",
        classes: [], setup: "Open", duration: "TBD", frequency: "Weekly",
        tyreLimit: "N/A", assists: "None", warmers: "No", fuel: "1x"
      };
      continue;
    }

    if (currentBlock && currentBlock.type === 'weekly') {
      if (line.toLowerCase().startsWith('car class:')) {
        const cText = line.split(':')[1].replace('&', ',').split(',');
        currentBlock.classes = cText.map(c => c.trim()).filter(c => c.length > 0);
      }
      else if (line.toLowerCase().startsWith('setups:')) {
        currentBlock.setup = line.split(':')[1].trim();
      }
      else if (line.toLowerCase().startsWith('entry requirement:')) {
        const req = line.split(':')[1].toUpperCase();
        if (req.includes('SILVER')) { currentBlock.sr = "SILVER"; currentBlock.theme = "theme-silver"; }
        else if (req.includes('GOLD')) { currentBlock.sr = "GOLD"; currentBlock.theme = "theme-gold"; }
        else { currentBlock.sr = "BRONZE"; currentBlock.theme = "theme-bronze"; }
      }
      else if (line.toLowerCase().startsWith('session lengths:')) {
        const match = line.match(/([0-9]+)m(?:in)? races/i) || line.match(/([0-9]+)\s*hours?/i);
        if (match) currentBlock.duration = match[0];
      }
      else if (line.toLowerCase().startsWith('fuel use')) {
        const fmatch = line.match(/([0-9]+x)/i);
        if (fmatch) currentBlock.fuel = fmatch[1];
      }
      else if (line.toLowerCase().startsWith('tyres available:')) {
        currentBlock.tyreLimit = line.split(':')[1].trim();
      }
      else if (line.toLowerCase().startsWith('sessions start')) {
        currentBlock.frequency = "Specific days/times"; 
      }
      else if (line.toLowerCase().startsWith('week 1:')) {
        const weeks = line.split('|');
        const w1 = weeks[0].split(':')[1];
        let track = w1 ? w1.trim() : "Unknown";

        custom.weekly.push({
          title: currentBlock.title,
          track: track + " (W1)",
          times: `<div class="sch-weeks-grid">` + line.split('|').map(w => `<div>${w.trim()}</div>`).join('') + `</div>`,
          sr: currentBlock.sr,
          theme: currentBlock.theme,
          classes: currentBlock.classes,
          frequency: currentBlock.frequency,
          duration: currentBlock.duration,
          setup: currentBlock.setup,
          fuel: currentBlock.fuel,
          tyresLimit: currentBlock.tyreLimit,
          assists: currentBlock.assists,
          warmers: currentBlock.warmers
        });
      }
    }
  }

  if (custom.daily.length === 0) {
    custom.daily = (currentSchedule && currentSchedule.daily && currentSchedule.daily.length > 0) 
      ? currentSchedule.daily 
      : (typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA.daily : []);
  }
  if (custom.weekly.length === 0) {
    custom.weekly = (currentSchedule && currentSchedule.weekly && currentSchedule.weekly.length > 0) 
      ? currentSchedule.weekly 
      : (typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA.weekly : []);
  }

  if (custom.daily.length > 0 || custom.weekly.length > 0) {
    localStorage.setItem('lmu_custom_schedule', JSON.stringify(custom));
    alert("Corridas importadas e mescladas com sucesso!\n- " + custom.daily.length + " Daily Races\n- " + custom.weekly.length + " Weekly Races");
    window.location.reload();
  } else {
    alert("Não foi possível ler as corridas. Verifique se o formato colado é o oficial do fórum.");
  }
}
