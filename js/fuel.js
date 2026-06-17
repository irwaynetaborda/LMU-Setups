// ============================================================
//  LMU SETUPS — fuel.js
//  Lógica da Calculadora de Combustível
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const btnCalc = document.getElementById('btn-calculate');
  
  if (btnCalc) {
    btnCalc.addEventListener('click', calculateFuel);
  }

  // Permite calcular apertando Enter nos inputs
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculateFuel();
    });
  });
});

function calculateFuel() {
  const durH = parseFloat(document.getElementById('f-dur-h').value) || 0;
  const durM = parseFloat(document.getElementById('f-dur-m').value) || 0;
  
  const lapM = parseFloat(document.getElementById('f-lap-m').value) || 0;
  const lapS = parseFloat(document.getElementById('f-lap-s').value) || 0;
  const lapMs = parseFloat(document.getElementById('f-lap-ms').value) || 0;
  
  const consumptionStr = document.getElementById('f-consumption').value.trim();
  const energyStr = document.getElementById('f-energy').value.trim();
  
  const marginStr = document.getElementById('f-margin').value;
  const formation = document.getElementById('f-formation').checked;

  const durationMin = (durH * 60) + durM;
  const laptimeSeconds = (lapM * 60) + lapS + (lapMs / 1000);

  if (durationMin <= 0) {
    alert("Por favor, preencha a duração da corrida.");
    return;
  }
  if (laptimeSeconds <= 0) {
    alert("Por favor, preencha o tempo de volta.");
    return;
  }

  const consumption = parseFloat(consumptionStr);
  if (isNaN(consumption) || consumption <= 0) {
    alert("Consumo por volta inválido.");
    return;
  }

  // 1. Duração total da corrida em segundos
  const durationSec = durationMin * 60;

  // 2. Total de voltas previstas (arredondado para cima)
  const baseLaps = Math.ceil(durationSec / laptimeSeconds);

  // 3. Voltas extras
  const marginLaps = parseInt(marginStr) || 0;
  const formationLap = formation ? 1 : 0;
  
  const totalLaps = baseLaps + marginLaps + formationLap;

  // 4. Combustível total
  const totalFuel = totalLaps * consumption;

  // Renderizar
  document.getElementById('res-laps').textContent = baseLaps;
  document.getElementById('res-total-laps').textContent = totalLaps;
  
  document.getElementById('res-fuel').textContent = totalFuel.toFixed(1);

  // Energy
  const energy = parseFloat(energyStr);
  const energyContainer = document.getElementById('res-energy-container');
  if (!isNaN(energy) && energy > 0) {
    const totalEnergy = totalLaps * energy;
    document.getElementById('res-energy').textContent = totalEnergy.toFixed(1);
    energyContainer.style.display = 'block';
  } else {
    energyContainer.style.display = 'none';
  }
  
  // Pequena animação no resultado
  const resCard = document.querySelector('.results-card');
  resCard.style.transform = 'scale(1.02)';
  setTimeout(() => resCard.style.transform = 'scale(1)', 200);
}

// removed
