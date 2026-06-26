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
  renderCards('special', 'pane-special');

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
    container.innerHTML = '<p style="color:var(--text-3);text-align:center">Nenhuma corrida programada.</p>';
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
            <span class="sch-stat-lbl">Extensão</span>
            <span class="sch-stat-val">${getTrackLength(item.track)}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Setup</span>
            <span class="sch-stat-val">${item.setup === 'Fixed' ? 'Fixo' : item.setup}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Duração</span>
            <span class="sch-stat-val">${item.duration}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Revezamento</span>
            <span class="sch-stat-val">${item.relay || 'Não'}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Mult. Combustível</span>
            <span class="sch-stat-val">${item.fuel || '1x'}</span>
          </div>
          <div class="sch-stat">
            <span class="sch-stat-lbl">Desgaste Pneu</span>
            <span class="sch-stat-val">${item.tyresLimit || '1x'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


