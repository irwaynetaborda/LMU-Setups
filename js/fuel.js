// ============================================================
//  LMU SETUPS — fuel.js
//  Lógica da Calculadora de Combustível Avançada (com Tank Maximizer)
// ============================================================

let currentTab = 'hypercar';

function updateSliderTrack(slEl) {
    if (!slEl) return;
    const min = parseFloat(slEl.min) || 0;
    const max = parseFloat(slEl.max) || 100;
    const val = parseFloat(slEl.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    slEl.style.background =
      `linear-gradient(to right, var(--red) ${pct}%, var(--bg-overlay) ${pct}%)`;
}

window.switchTab = function(tab) {
    currentTab = tab;
    document.querySelectorAll('.calc-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    
    if (tab === 'hypercar') {
        document.getElementById('field-tank-capacity').style.display = 'none';
        document.getElementById('field-max-fuel').style.display = 'none';
        document.getElementById('field-fuel-usage-2').style.display = 'none';
        
        document.getElementById('field-energy-usage').style.display = 'block';
        document.getElementById('field-max-energy').style.display = 'block';
        document.getElementById('field-fuel-usage-1').style.display = 'block';
        document.getElementById('req-energy-box').style.display = 'block';
        
        updateSliderTrack(document.getElementById('f-max-energy'));
    } else {
        document.getElementById('field-tank-capacity').style.display = 'block';
        document.getElementById('field-max-fuel').style.display = 'block';
        document.getElementById('field-fuel-usage-2').style.display = 'block';
        
        document.getElementById('field-energy-usage').style.display = 'none';
        document.getElementById('field-max-energy').style.display = 'none';
        document.getElementById('field-fuel-usage-1').style.display = 'none';
        document.getElementById('req-energy-box').style.display = 'none';
        
        updateSliderTrack(document.getElementById('f-max-fuel'));
    }
};

document.addEventListener('DOMContentLoaded', () => {
  const btnCalc = document.getElementById('btn-calculate');
  const btnReset = document.getElementById('btn-reset');
  
  if (btnCalc) btnCalc.addEventListener('click', calculateFuel);
  if (btnReset) btnReset.addEventListener('click', () => {
      document.querySelectorAll('.form-input').forEach(i => i.value = '');
      document.getElementById('results-panel').style.display = 'none';
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculateFuel();
    });
  });

  const maxEnergy = document.getElementById('f-max-energy');
  if (maxEnergy) {
      updateSliderTrack(maxEnergy);
      maxEnergy.addEventListener('input', (e) => {
          document.getElementById('val-max-energy').textContent = e.target.value;
          updateSliderTrack(e.target);
      });
  }
  const maxFuel = document.getElementById('f-max-fuel');
  if (maxFuel) {
      updateSliderTrack(maxFuel);
      maxFuel.addEventListener('input', (e) => {
          document.getElementById('val-max-fuel').textContent = e.target.value;
          updateSliderTrack(e.target);
      });
  }

  const tyreStrat = document.getElementById('f-tyre-strat');
  if (tyreStrat) {
      tyreStrat.addEventListener('change', (e) => {
          const val = e.target.value;
          const extra1 = document.getElementById('tyre-extra-opts');
          const extra2 = document.getElementById('tyre-extra-opts2');
          if (val === 'optimum') {
              if (extra1) extra1.style.display = 'flex';
              if (extra2) extra2.style.display = 'flex';
          } else {
              if (extra1) extra1.style.display = 'none';
              if (extra2) extra2.style.display = 'none';
          }
      });
      tyreStrat.dispatchEvent(new Event('change'));
  }

  // Modal logic
  const btnHowTo = document.getElementById('btn-how-to');
  const modalHowTo = document.getElementById('how-to-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  if (btnHowTo && modalHowTo && btnCloseModal) {
      btnHowTo.addEventListener('click', () => {
          modalHowTo.style.display = 'flex';
      });

      btnCloseModal.addEventListener('click', () => {
          modalHowTo.style.display = 'none';
      });

      modalHowTo.addEventListener('click', (e) => {
          if (e.target === modalHowTo) {
              modalHowTo.style.display = 'none';
          }
      });
  }
});

function calculateFuel() {
  const durH = parseFloat(document.getElementById('f-dur-h').value) || 0;
  const durM = parseFloat(document.getElementById('f-dur-m').value) || 0;
  
  const lapM = parseFloat(document.getElementById('f-lap-m').value) || 0;
  const lapS = parseFloat(document.getElementById('f-lap-s').value) || 0;
  const lapMs = parseFloat(document.getElementById('f-lap-ms').value) || 0;
  
  const durationSec = (durH * 3600) + (durM * 60);
  const laptimeSec = (lapM * 60) + lapS + (lapMs / 1000);

  if (durationSec <= 0 || laptimeSec <= 0) {
    alert("Por favor, preencha a Duração da Corrida e o Tempo de Volta.");
    return;
  }

  const ignoreSafe = document.getElementById('f-ignore-safe').checked;
  const tyreStratVal = document.getElementById('f-tyre-strat').value;

  let flatOutMaxLaps = 1;
  let flatOutConsumption = 0;
  let flatOutEnergy = 0;
  let actualTank = 0;
  let actualMaxEnergy = 0;
  let fuelRate = 1.2;

  if (currentTab === 'hypercar') {
      flatOutConsumption = parseFloat(document.getElementById('f-consumption').value) || 0;
      flatOutEnergy = parseFloat(document.getElementById('f-energy').value) || 0;
      actualMaxEnergy = parseFloat(document.getElementById('f-max-energy').value) || 100;
      actualTank = 999; 
      fuelRate = 1.2;
      
      if (flatOutConsumption <= 0 || flatOutEnergy <= 0) {
          alert("Preencha Consumo de Combustível e Uso de Energia para a aba Hypercar/LMGT3.");
          return;
      }
      flatOutMaxLaps = Math.floor(actualMaxEnergy / flatOutEnergy);
  } else {
      flatOutConsumption = parseFloat(document.getElementById('f-consumption-lmp2').value) || 0;
      const baseTank = parseFloat(document.getElementById('f-tank').value) || 0;
      const maxFuelPct = parseFloat(document.getElementById('f-max-fuel').value) || 100;
      actualTank = baseTank * (maxFuelPct / 100);
      actualMaxEnergy = 999; 
      fuelRate = 3.0; // LMP2 fast refuel
      
      if (flatOutConsumption <= 0 || actualTank <= 0) {
          alert("Preencha Consumo de Combustível e Capacidade do Tanque para a aba LMP2.");
          return;
      }
      flatOutMaxLaps = Math.floor(actualTank / flatOutConsumption);
  }

  if (flatOutMaxLaps < 1) flatOutMaxLaps = 1;

  // Laps Calculation
  let exactLaps = durationSec / laptimeSec;
  let baseLaps = Math.ceil(exactLaps); 
  
  // Calculate Base Flat Out Stints to determine Pit Time and Race Clock
  let { stints: baseStints, totalPitTime: basePitTime } = generateStints(
      baseLaps, flatOutMaxLaps, flatOutConsumption, flatOutEnergy, actualTank, actualMaxEnergy, tyreStratVal, fuelRate, false
  );
  
  let baseRaceClock = durationSec - ((baseLaps - 1) * laptimeSec) - basePitTime;
  let safetyRecommended = (laptimeSec - baseRaceClock) < 25;
  
  let safeLaps = baseLaps;
  if (safetyRecommended && !ignoreSafe) {
      safeLaps = baseLaps + 1;
  }
  
  // Now generate actual Flat Out Stints
  let { stints: flatOutStints, totalPitTime: flatOutTotalPitTime } = generateStints(
      safeLaps, flatOutMaxLaps, flatOutConsumption, flatOutEnergy, actualTank, actualMaxEnergy, tyreStratVal, fuelRate, false
  );
  
  let reqFuelMin = baseLaps * flatOutConsumption;
  let reqFuelSafe = safeLaps * flatOutConsumption;

  document.getElementById('res-laps-min').textContent = baseLaps;
  const resLapsSafe = document.getElementById('res-laps-safe');
  if (resLapsSafe) resLapsSafe.textContent = safeLaps;
  document.getElementById('res-fuel-min').textContent = reqFuelMin.toFixed(1);
  const resFuelSafe = document.getElementById('res-fuel-safe');
  if (resFuelSafe) resFuelSafe.textContent = reqFuelSafe.toFixed(1);
  if (currentTab === 'hypercar') {
      document.getElementById('res-energy-min').textContent = Math.ceil(baseLaps * flatOutEnergy);
  }

  // Flat Out Race Clock
  let flatOutLastLapStartClock = durationSec - ((safeLaps - 1) * laptimeSec) - flatOutTotalPitTime;
  document.getElementById('res-race-clock').textContent = Math.floor(flatOutLastLapStartClock) + 's';

  let flatOutSafetyRec = safetyRecommended ? "Sim" : "Não";
  let flatOutSafetyIcon = safetyRecommended ? "⚠️" : "✅";
  
  document.getElementById('res-safety-rec').textContent = flatOutSafetyRec;
  document.getElementById('res-safety-icon').textContent = flatOutSafetyIcon;

  document.getElementById('stints-container').innerHTML = renderStintsHtml(flatOutStints, tyreStratVal);

  // Tank Maximizer Logic
  let ecoLapsPerStint = flatOutMaxLaps + 1;
  let { stints: ecoStints, totalPitTime: ecoTotalPitTime } = generateStints(
      safeLaps, ecoLapsPerStint, flatOutConsumption, flatOutEnergy, actualTank, actualMaxEnergy, tyreStratVal, fuelRate, true
  );

  let timeSavedInPit = flatOutTotalPitTime - ecoTotalPitTime;
  
  if (ecoLapsPerStint <= safeLaps) {
      document.getElementById('section-eco').style.display = 'block';
      
      let ecoSaveLaps = 0;
      for(let s of ecoStints) {
          if (s.laps === ecoLapsPerStint) ecoSaveLaps += s.laps;
      }
      if (ecoSaveLaps === 0) ecoSaveLaps = ecoLapsPerStint;

      let estimatedLossPerLap = 0;
      if (currentTab === 'hypercar') {
          let delta = flatOutStints[0].targetEnergy - ecoStints[0].targetEnergy;
          if (delta < 0) delta = 0;
          estimatedLossPerLap = delta * 0.748;
      } else {
          let delta = flatOutStints[0].targetFuel - ecoStints[0].targetFuel;
          if (delta < 0) delta = 0;
          estimatedLossPerLap = delta * 2.0; 
      }
      
      let estimatedTimeGain = timeSavedInPit - (ecoSaveLaps * estimatedLossPerLap);
      let ecoLastLapStartClock = durationSec - ((safeLaps - 1) * laptimeSec) - ecoTotalPitTime - (ecoSaveLaps * estimatedLossPerLap);
      let ecoSafetyRecommended = (laptimeSec - ecoLastLapStartClock) < 25;

      // Handle eco metrics visibility
      let ecoMetricsEl = document.getElementById('eco-metrics');
      if (ecoMetricsEl) {
          if (timeSavedInPit > 0 || estimatedTimeGain > -999) {
              ecoMetricsEl.style.display = 'grid';
              document.getElementById('eco-save-laps').textContent = ecoSaveLaps;
              document.getElementById('eco-time-saved').textContent = Math.floor(timeSavedInPit) + 's';
              document.getElementById('eco-max-loss').textContent = (timeSavedInPit / ecoSaveLaps).toFixed(3) + 's';
              document.getElementById('eco-est-gain').textContent = estimatedTimeGain.toFixed(3) + 's';
          } else {
              ecoMetricsEl.style.display = 'none';
          }
      }
      
      document.getElementById('eco-race-clock').textContent = Math.floor(ecoLastLapStartClock) + 's';
      document.getElementById('eco-safety-rec').textContent = ecoSafetyRecommended ? "Sim" : "Não";
      document.getElementById('eco-safety-icon').textContent = ecoSafetyRecommended ? "⚠️" : "✅";

      ecoStints[0].isEco = true;
      ecoStints[0].saveLaps = ecoLapsPerStint - flatOutMaxLaps;
      
      document.getElementById('eco-stints-container').innerHTML = renderStintsHtml(ecoStints, tyreStratVal);
  } else {
      document.getElementById('section-eco').style.display = 'none';
  }

  // Fuel Ratio display 
  let fuelRatioText = "-";
  if (currentTab === 'hypercar') {
      let ratio = Math.ceil((flatOutConsumption / flatOutEnergy) * 100) / 100;
      fuelRatioText = ratio.toFixed(2);
  }
  document.getElementById('res-fuel-ratio').textContent = fuelRatioText;

  document.getElementById('results-panel').style.display = 'flex';
}

function generateStints(safeLaps, maxLapsPerStint, flatOutConsumption, flatOutEnergy, actualTank, actualMaxEnergy, tyreStratVal, fuelRate, isEco) {
  let stints = [];
  let lapsRemaining = safeLaps;
  while(lapsRemaining > 0) {
      let lapsThisStint = Math.min(lapsRemaining, maxLapsPerStint);
      stints.push({ laps: lapsThisStint });
      lapsRemaining -= lapsThisStint;
  }

  let tyreChangeFreq = 0;
  if (tyreStratVal === '1') tyreChangeFreq = 1;
  else if (tyreStratVal === '2') tyreChangeFreq = 2;
  else if (tyreStratVal === '3') tyreChangeFreq = 3;
  else if (tyreStratVal === '4') tyreChangeFreq = 4;
  else if (tyreStratVal === 'optimum') tyreChangeFreq = 1;

  let totalPitTime = 0;
  let isHyper = currentTab === 'hypercar';
  
  let fullTankFuel = isHyper ? Math.ceil(actualMaxEnergy / flatOutEnergy * flatOutConsumption) : actualTank;

  for (let index = 0; index < stints.length; index++) {
      let s = stints[index];
      let stintNum = index + 1;
      let isStint1 = (stintNum === 1);
      s.stintNum = stintNum;
      
      let availableFuel = (isStint1 && !isHyper) ? actualTank - 0.5 : actualTank;
      let availableEnergy = actualMaxEnergy; 
      
      if (isEco) {
          s.targetFuel = Math.ceil((availableFuel / s.laps) * 100) / 100;
          s.targetEnergy = Math.ceil((availableEnergy / s.laps) * 100) / 100;
          
          if (s.targetFuel > flatOutConsumption) s.targetFuel = flatOutConsumption;
          if (s.targetEnergy > flatOutEnergy) s.targetEnergy = flatOutEnergy;
          
          if (isHyper) {
              s.reqFuel = isStint1 ? Math.max(fullTankFuel, Math.ceil(s.laps * flatOutConsumption)) : Math.ceil(s.laps * flatOutConsumption);
              s.reqEnergy = isStint1 ? actualMaxEnergy : Math.min(actualMaxEnergy, s.laps * flatOutEnergy);
          } else {
              s.reqFuel = isStint1 ? actualTank : Math.min(actualTank, s.laps * flatOutConsumption);
              s.reqEnergy = 0;
          }
      } else {
          if (s.laps * flatOutConsumption > availableFuel) {
              s.targetFuel = Math.ceil((availableFuel / s.laps) * 100) / 100;
              if (isHyper) {
                  s.reqFuel = isStint1 ? Math.max(fullTankFuel, Math.ceil(s.laps * flatOutConsumption)) : Math.ceil(s.laps * flatOutConsumption);
              } else {
                  s.reqFuel = isStint1 ? actualTank - 0.5 : availableFuel;
              }
          } else {
              s.targetFuel = flatOutConsumption;
              if (isHyper) {
                  s.reqFuel = isStint1 ? Math.max(fullTankFuel, Math.ceil(s.laps * flatOutConsumption)) : Math.ceil(s.laps * flatOutConsumption);
              } else {
                  s.reqFuel = isStint1 ? actualTank - 0.5 : Math.ceil(s.laps * flatOutConsumption);
              }
          }
          
          if (s.laps * flatOutEnergy > availableEnergy) {
              s.targetEnergy = Math.ceil((availableEnergy / s.laps) * 100) / 100;
              s.reqEnergy = isStint1 ? actualMaxEnergy : availableEnergy;
          } else {
              s.targetEnergy = flatOutEnergy;
              s.reqEnergy = isStint1 ? actualMaxEnergy : Math.min(actualMaxEnergy, s.laps * flatOutEnergy);
          }
      }

      s.targetFuelStr = s.targetFuel.toFixed(2) + ' litros';
      s.targetEnergyStr = isHyper ? s.targetEnergy.toFixed(2) + ' %' : '-';

      let ratio = s.reqEnergy > 0 ? (s.reqFuel / s.reqEnergy) : 0;
      s.fuelRatioStr = isHyper ? ratio.toFixed(2) : '-';

      s.refuelEnergy = isEco ? s.laps * s.targetEnergy : s.laps * flatOutEnergy; 
      s.refuelFuel = isEco ? s.laps * s.targetFuel : s.laps * flatOutConsumption;
      
      s.pitLength = 0;
      s.tyreChangeText = 'Sem troca de pneus';
      s.tyreOpacity = '0.2';
      s.tyresChanged = 0;
      
      if (isStint1) {
           s.pitLength = 0;
           s.tyreChangeText = 'Todos os pneus';
           s.tyreOpacity = '1';
           s.tyresChanged = 4;
           s.refuelPct = isHyper ? 100 : (actualTank / actualTank * 100);
           s.refuelStr = isHyper ? '100 %' : actualTank + ' litros';
           
           if (!isHyper && !isEco) {
               s.refuelStr = s.reqFuel + ' litros';
           } else if (!isHyper && isEco) {
               s.refuelStr = s.reqFuel + ' litros';
           }
      } else {
           s.pitLength = 30 + Math.floor(s.refuelFuel / fuelRate);
           
           if (tyreChangeFreq > 0 && ((stintNum - 1) % tyreChangeFreq === 0)) {
               s.tyreChangeText = 'Todos os pneus';
               s.tyreOpacity = '1';
               s.tyresChanged = 4;
               s.pitLength = Math.max(s.pitLength, 30 + 25);
           }
           totalPitTime += s.pitLength;
           
           s.refuelPct = isHyper ? s.refuelEnergy : (s.refuelFuel / actualTank * 100);
           s.refuelStr = isHyper ? s.refuelPct.toFixed(0) + ' %' : Math.ceil(s.refuelFuel) + ' litros';
      }
  }

  return { stints, totalPitTime };
}

function renderStintsHtml(stints, tyreStratVal) {
  let html = '';
  stints.forEach((s) => {
      let isHyper = currentTab === 'hypercar';
      
      let headerText = `${s.laps} VOLTAS`;
      if (s.isEco && s.saveLaps) {
          headerText += ` (SALVAR ${s.saveLaps} VOLTA${s.saveLaps > 1 ? 'S' : ''})`;
      }

      html += `
      <div style="background: var(--bg-surface); border: 1px solid #333; border-radius: var(--r-md); overflow: hidden; display: flex; flex-direction: column;">
        <div style="background: var(--red); padding: 8px 16px; display: flex; align-items: center; justify-content: center; position: relative;">
          <span style="position: absolute; left: 16px; background: #fff; color: var(--red); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">${s.stintNum}</span>
          <span style="color: #fff; font-weight: 800; font-size: 1rem;">${headerText}</span>
        </div>
        
        <div style="padding: 16px; display: grid; grid-template-columns: 1fr 100px; gap: 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; gap: 16px;">
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">ALVO (POR VOLTA)</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">
                    <span style="color:#3b82f6;">⛽</span> ${s.targetFuelStr}
                  </div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">&nbsp;</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">
                    <span style="color:#3b82f6;">⚡</span> ${s.targetEnergyStr}
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 16px;">
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">REQUISITOS</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">
                    <span style="color:#3b82f6;">⛽</span> ${s.reqFuel} ${isHyper ? 'litros' : 'litros'}
                  </div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">&nbsp;</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">
                    <span style="color:#3b82f6;">⚡</span> ${isHyper ? s.reqEnergy.toFixed(1) + ' %' : '-'}
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 16px;">
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">PROPORÇÃO COMB.</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">${s.fuelRatioStr}</div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #888; font-weight: 800;">TEMPO NO BOX</div>
                  <div style="color: #fff; font-size: 0.95rem; font-weight:500;">${s.pitLength}s</div>
                </div>
              </div>
              <div style="margin-top: 8px;">
                <div style="font-size: 0.7rem; color: #888; font-weight: 800;">DETALHES DO PIT</div>
                <div style="color: #fff; font-size: 0.85rem;">
                  <span style="color:#3b82f6;">Abastecer:</span> ${s.refuelStr} &nbsp;&nbsp; 
                  <span style="color:#3b82f6;">Pneus:</span> ${s.tyresChanged}
                </div>
              </div>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 8px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px 16px; margin-bottom: 16px; position: relative; width: 48px;">
                <div style="position:absolute; left:50%; top:10%; bottom:10%; width:2px; background:#444; transform:translateX(-50%); z-index:0;"></div>
                <div style="position:absolute; left:10%; right:10%; top:15%; height:2px; background:#444; z-index:0;"></div>
                <div style="position:absolute; left:10%; right:10%; bottom:15%; height:2px; background:#444; z-index:0;"></div>
                
                <div style="width: 14px; height: 28px; background: #3b82f6; border-radius: 4px; opacity: ${s.tyreOpacity}; z-index:1; margin:0 auto;"></div>
                <div style="width: 14px; height: 28px; background: #3b82f6; border-radius: 4px; opacity: ${s.tyreOpacity}; z-index:1; margin:0 auto;"></div>
                <div style="width: 14px; height: 28px; background: #3b82f6; border-radius: 4px; opacity: ${s.tyreOpacity}; z-index:1; margin:0 auto;"></div>
                <div style="width: 14px; height: 28px; background: #3b82f6; border-radius: 4px; opacity: ${s.tyreOpacity}; z-index:1; margin:0 auto;"></div>
              </div>
              <div style="font-size: 0.7rem; color: #aaa; text-align:center;"><span style="color:#3b82f6;">Troca de pneus:</span><br>${s.tyreChangeText}</div>
          </div>
        </div>
      </div>
      `;
  });
  return html;
}
