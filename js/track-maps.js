// ============================================================
//  LMU SETUPS — track-maps.js
//  Renderiza SVGs proporcionais para as pistas
// ============================================================

const TRACK_NAMES = [
  'Spa-Francorchamps', 'Le Mans', 'Bahrain', 'Fuji', 'Monza', 'Sebring', 
  'Portimao', 'Imola', 'Interlagos', 'COTA', 'Silverstone', 'Lusail', 'Paul Ricard', 'Barcelona'
];

function getTrackMap(trackName) {
  let foundKey = 'default';
  if (trackName) {
    const t = trackName.toLowerCase();
    for (const key of TRACK_NAMES) {
      if (t.includes(key.toLowerCase()) || 
          (key === 'Portimao' && t.includes('algarve')) ||
          (key === 'Le Mans' && t.includes('sarthe')) ||
          (key === 'Lusail' && t.includes('qatar')) ||
          (key === 'Interlagos' && (t.includes('interlagos') || t.includes('carlos pace')))) {
        foundKey = key;
        break;
      }
    }
  }
  
  const fileName = foundKey.toLowerCase().replace(/\s+/g, '-');
  return `<img src="img/maps/${fileName}.png" class="sch-abstract-map sch-map-${fileName}" alt="${foundKey}" onerror="this.style.display='none'" />`;
}

function getTrackLength(trackName) {
  if (!trackName) return 'N/A';
  const t = trackName.toLowerCase();
  if (t.includes('sarthe') || t.includes('le mans')) return '13.626 KM';
  if (t.includes('spa')) return '7.004 KM';
  if (t.includes('sebring')) return '6.019 KM';
  if (t.includes('silverstone')) return '5.890 KM';
  if (t.includes('monza')) return '5.793 KM';
  if (t.includes('paul ricard')) return '5.771 KM';
  if (t.includes('cota') || t.includes('americas')) return '5.513 KM';
  if (t.includes('qatar')) return '5.419 KM';
  if (t.includes('bahrain')) return '5.412 KM';
  if (t.includes('imola')) return '4.909 KM';
  if (t.includes('barcelona')) return '4.657 KM';
  if (t.includes('algarve') || t.includes('portimao')) return '4.653 KM';
  if (t.includes('fuji')) return '4.563 KM';
  if (t.includes('interlagos') || t.includes('carlos pace')) return '4.309 KM';
  return 'N/A';
}
