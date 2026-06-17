// ============================================================
//  LMU SETUPS — data.js
//  Dados estáticos do jogo Le Mans Ultimate (v1.3 / mid-2026)
// ============================================================

const LMU_DATA = {

  // ── MARCAS (LOGOS) ────────────────────────────────────────
  brands: {
    // O usuário vai baixar as logos coloridas originais e colocar na pasta img/logos/
    toyota:       { name: 'Toyota',       logo: 'img/logos/toyota.png' },
    ferrari:      { name: 'Ferrari',      logo: 'img/logos/ferrari.png' },
    porsche:      { name: 'Porsche',      logo: 'img/logos/porsche.png' },
    cadillac:     { name: 'Cadillac',     logo: 'img/logos/cadillac.png' },
    bmw:          { name: 'BMW',          logo: 'img/logos/bmw.png' },
    alpine:       { name: 'Alpine',       logo: 'img/logos/alpine.png' },
    peugeot:      { name: 'Peugeot',      logo: 'img/logos/peugeot.png' },
    lamborghini:  { name: 'Lamborghini',  logo: 'img/logos/lamborghini.png' },
    astonmartin:  { name: 'Aston Martin', logo: 'img/logos/astonmartin.png' },
    chevrolet:    { name: 'Chevrolet',    logo: 'img/logos/chevrolet.png' },
    ford:         { name: 'Ford',         logo: 'img/logos/ford.png' },
    lexus:        { name: 'Lexus',        logo: 'img/logos/lexus.png' },
    mclaren:      { name: 'McLaren',      logo: 'img/logos/mclaren.png' },
    mercedes:     { name: 'Mercedes-AMG', logo: 'img/logos/mercedes.png' },
    hyundai:      { name: 'Genesis',      logo: 'img/logos/genesis.png' },
    // Para as que não tem icon, usamos fallback de texto ou o usuário pode adicionar depois
    glickenhaus:  { name: 'Glickenhaus',  logo: 'img/logos/glickenhaus.png', short: 'GLI' },
    vanwall:      { name: 'Vanwall',      logo: 'img/logos/vanwall.png', short: 'VAN' },
    isotta:       { name: 'Isotta',       logo: 'img/logos/isotta.png', short: 'ISO' },
    oreca:        { name: 'Oreca',        logo: 'img/logos/oreca.png', short: 'ORE' },
    ligier:       { name: 'Ligier',       logo: 'img/logos/ligier.png', short: 'LIG' },
    ginetta:      { name: 'Ginetta',      logo: 'img/logos/ginetta.png', short: 'GIN' },
    duqueine:     { name: 'Duqueine',     logo: 'img/logos/duqueine.png', short: 'DUQ' },
  },

  // ── CLASSES ──────────────────────────────────────────────
  classes: [
    { id: 'hypercar', name: 'Hypercar', color: '#e8002d', bg: 'rgba(232,0,45,0.12)', border: 'rgba(232,0,45,0.35)', hasABS: true },
    { id: 'lmp2',     name: 'LMP2',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', hasABS: true },
    { id: 'lmp3',     name: 'LMP3',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', hasABS: false },
    { id: 'lmgt3',    name: 'LMGT3',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  hasABS: true },
    { id: 'gte',      name: 'GTE',      color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', hasABS: true },
  ],

  // ── PISTAS ───────────────────────────────────────────────
  tracks: [
    {
      id: 'le_mans',
      name: 'Circuit de la Sarthe',
      shortName: 'Le Mans',
      country: 'França', flag: '🇫🇷',
      layouts: ['Full Circuit', 'Mulsanne No Chicanes'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'spa',
      name: 'Circuit de Spa-Francorchamps',
      shortName: 'Spa',
      country: 'Bélgica', flag: '🇧🇪',
      layouts: ['Grand Prix', 'Endurance'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'monza',
      name: 'Autodromo Nazionale Monza',
      shortName: 'Monza',
      country: 'Itália', flag: '🇮🇹',
      layouts: ['Grand Prix'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'bahrain',
      name: 'Bahrain International Circuit',
      shortName: 'Bahrain',
      country: 'Bahrein', flag: '🇧🇭',
      layouts: ['Endurance Circuit', 'Grand Prix Circuit', 'Outer Circuit', 'Paddock Circuit'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'fuji',
      name: 'Fuji Speedway',
      shortName: 'Fuji',
      country: 'Japão', flag: '🇯🇵',
      layouts: ['Grand Prix'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'portimao',
      name: 'Algarve International Circuit',
      shortName: 'Portimão',
      country: 'Portugal', flag: '🇵🇹',
      layouts: ['Full Circuit'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'sebring',
      name: 'Sebring International Raceway',
      shortName: 'Sebring',
      country: 'EUA', flag: '🇺🇸',
      layouts: ['Full Circuit'],
      dlc: false, series: 'WEC',
    },
    {
      id: 'imola',
      name: 'Autodromo Enzo e Dino Ferrari',
      shortName: 'Imola',
      country: 'Itália', flag: '🇮🇹',
      layouts: ['Grand Prix'],
      dlc: true, series: 'WEC',
    },
    {
      id: 'interlagos',
      name: 'Autódromo José Carlos Pace',
      shortName: 'Interlagos',
      country: 'Brasil', flag: '🇧🇷',
      layouts: ['Grand Prix'],
      dlc: true, series: 'WEC',
    },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      shortName: 'COTA',
      country: 'EUA', flag: '🇺🇸',
      layouts: ['Grand Prix'],
      dlc: true, series: 'WEC',
    },
    {
      id: 'qatar',
      name: 'Lusail International Circuit',
      shortName: 'Qatar',
      country: 'Catar', flag: '🇶🇦',
      layouts: ['Grand Prix'],
      dlc: true, series: 'WEC',
    },
    {
      id: 'silverstone',
      name: 'Silverstone Circuit',
      shortName: 'Silverstone',
      country: 'Reino Unido', flag: '🇬🇧',
      layouts: ['National', 'International', 'WEC Grand Prix'],
      dlc: true, series: 'ELMS',
    },
    {
      id: 'paul_ricard',
      name: 'Circuit Paul Ricard',
      shortName: 'Paul Ricard',
      country: 'França', flag: '🇫🇷',
      layouts: ['WEC', 'Short Circuit', 'Long Circuit', 'Grand Prix'],
      dlc: true, series: 'ELMS',
    },
    {
      id: 'barcelona',
      name: 'Circuit de Barcelona-Catalunya',
      shortName: 'Barcelona',
      country: 'Espanha', flag: '🇪🇸',
      layouts: ['Grand Prix'],
      dlc: true, series: 'ELMS',
    },
  ],

  // ── CARROS ───────────────────────────────────────────────
  cars: [
    // HYPERCAR
    { id: 'toyota_gr010',       name: 'Toyota GR010 Hybrid',          brand: 'toyota',      class: 'hypercar', years: ['2023','2024'],       dlc: false, image: 'img/cars/hypercars/Toyota-GR010-5.png' },
    { id: 'ferrari_499p',       name: 'Ferrari 499P',                 brand: 'ferrari',     class: 'hypercar', years: ['2023','2024','2025'], dlc: false, image: 'img/cars/hypercars/Ferrari-499-3.png' },
    { id: 'porsche_963',        name: 'Porsche 963',                  brand: 'porsche',     class: 'hypercar', years: ['2023','2024','2025'], dlc: false, image: 'img/cars/hypercars/Porsche-963.png' },
    { id: 'cadillac_vseriesr',  name: 'Cadillac V-Series.R',          brand: 'cadillac',    class: 'hypercar', years: ['2023','2024'],        dlc: false, image: 'img/cars/cadillac_vseriesr.png' },
    { id: 'bmw_m_hybrid_v8',    name: 'BMW M Hybrid V8',              brand: 'bmw',         class: 'hypercar', years: ['2023','2024'],        dlc: false, image: 'img/cars/hypercars/BMW-M-HY-V8-Art.png' },
    { id: 'bmw_m_hybrid_evo',   name: 'BMW M Hybrid V8 Evo',          brand: 'bmw',         class: 'hypercar', years: ['2024','2025'],        dlc: false, image: 'img/cars/hypercars/BMW-M-HY-V8-Art.png' },
    { id: 'alpine_a424',        name: 'Alpine A424',                  brand: 'alpine',      class: 'hypercar', years: ['2024','2025'],        dlc: false, image: 'img/cars/hypercars/Alpine-Solo-LM-7-1.png' },
    { id: 'peugeot_9x8_23',     name: 'Peugeot 9X8 (Sem Asa)',        brand: 'peugeot',     class: 'hypercar', years: ['2023'],              dlc: false, image: 'img/cars/hypercars/peugeout 9x8.png' },
    { id: 'peugeot_9x8_24',     name: 'Peugeot 9X8 (Com Asa)',        brand: 'peugeot',     class: 'hypercar', years: ['2024','2025'],        dlc: false, image: 'img/cars/hypercars/Peugeot-9X8-6.png' },
    { id: 'glickenhaus_007',    name: 'Glickenhaus SCG 007',          brand: 'glickenhaus', class: 'hypercar', years: ['2023'],              dlc: false, image: 'img/cars/hypercars/glicknhaus scg 007.png' },
    { id: 'vanwall_680',        name: 'Vanwall Vandervell 680',       brand: 'vanwall',     class: 'hypercar', years: ['2023'],              dlc: false, image: 'img/cars/hypercars/vanwall vandervell 680.png' },
    { id: 'isotta_tipo6',       name: 'Isotta Fraschini Tipo 6 LMH-C',brand: 'isotta',      class: 'hypercar', years: ['2024','2025'],       dlc: true,  image: 'img/cars/hypercars/isotta fraschini.png' },
    { id: 'lamborghini_sc63',   name: 'Lamborghini SC63',             brand: 'lamborghini', class: 'hypercar', years: ['2024','2025'],        dlc: true,  image: 'img/cars/hypercars/lamborghini sc63.png' },
    { id: 'aston_valkyrie',     name: 'Aston Martin Valkyrie AMR-LMH',brand: 'astonmartin', class: 'hypercar', years: ['2025'],              dlc: true,  image: 'img/cars/hypercars/aston martin valkyrie amr-lmh.png' },
    { id: 'genesis_gmr001',     name: 'Genesis GMR-001',              brand: 'hyundai',     class: 'hypercar', years: ['2025'],              dlc: true  },

    // LMP2
    { id: 'oreca_07',           name: 'Oreca 07 Gibson',              brand: 'oreca',       class: 'lmp2',     years: ['2023','2024','2025'], dlc: false, image: 'img/cars/oreca_07.png' },

    // LMP3 (ELMS DLC)
    { id: 'ligier_p325',        name: 'Ligier JS P325',               brand: 'ligier',      class: 'lmp3',     years: ['2024','2025'],        dlc: true  },
    { id: 'ginetta_g61',        name: 'Ginetta G61-LT-P3 Evo',        brand: 'ginetta',     class: 'lmp3',     years: ['2024','2025'],        dlc: true,  image: 'img/cars/ginetta_g61.png' },
    { id: 'duqueine_d09',       name: 'Duqueine D09',                 brand: 'duqueine',    class: 'lmp3',     years: ['2024','2025'],        dlc: true  },

    // LMGT3
    { id: 'aston_vantage_gt3',  name: 'Aston Martin Vantage AMR LMGT3', brand: 'astonmartin', class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/aston_vantage_gt3.png' },
    { id: 'bmw_m4_gt3',         name: 'BMW M4 LMGT3 Evo',               brand: 'bmw',         class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/bmw_m4_gt3.png' },
    { id: 'corvette_z06',       name: 'Chevrolet Corvette Z06 LMGT3.R',  brand: 'chevrolet',   class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/corvette_z06.png' },
    { id: 'ferrari_296_gt3',    name: 'Ferrari 296 LMGT3',              brand: 'ferrari',     class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/ferrari_296_gt3.png' },
    { id: 'ford_mustang_gt3',   name: 'Ford Mustang LMGT3',             brand: 'ford',        class: 'lmgt3', years: ['2024','2025'],        dlc: false },
    { id: 'lamborghini_evo2',   name: 'Lamborghini Huracán LMGT3 EVO2', brand: 'lamborghini', class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/lamborghini_evo2.png' },
    { id: 'lexus_rcf',          name: 'Lexus RC F LMGT3',               brand: 'lexus',       class: 'lmgt3', years: ['2024','2025'],        dlc: false },
    { id: 'mclaren_720s',       name: 'McLaren 720S LMGT3 Evo',         brand: 'mclaren',     class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/mclaren_720s.png' },
    { id: 'mercedes_amg_gt3',   name: 'Mercedes-AMG LMGT3',             brand: 'mercedes',    class: 'lmgt3', years: ['2024','2025'],        dlc: false, image: 'img/cars/mercedes_amg_gt3.png' },
    { id: 'porsche_992_gt3',    name: 'Porsche 911 GT3 R (992)',         brand: 'porsche',     class: 'lmgt3', years: ['2024','2025'],        dlc: false },

    // GTE (Legacy)
    { id: 'aston_gte',          name: 'Aston Martin Vantage AMR GTE', brand: 'astonmartin', class: 'gte',     years: ['2023'],              dlc: false, image: 'img/cars/aston_gte.png' },
    { id: 'corvette_gte',       name: 'Chevrolet Corvette C8.R GTE',  brand: 'chevrolet',   class: 'gte',     years: ['2023'],              dlc: false, image: 'img/cars/corvette_gte.png' },
    { id: 'ferrari_488_gte',    name: 'Ferrari 488 GTE Evo',          brand: 'ferrari',     class: 'gte',     years: ['2023'],              dlc: false, image: 'img/cars/ferrari_488_gte.png' },
    { id: 'porsche_rsr19',      name: 'Porsche 911 RSR-19',           brand: 'porsche',     class: 'gte',     years: ['2023'],              dlc: false, image: 'img/cars/porsche_rsr19.png' },
  ],

  // ── CONDIÇÕES ────────────────────────────────────────────
  conditions: [
    { id: 'dry',   name: 'Seco',   icon: '☀️' },
    { id: 'wet',   name: 'Chuva',  icon: '🌧️' },
    { id: 'mixed', name: 'Misto',  icon: '⛅' },
  ],

  // ── TIPOS DE SESSÃO ───────────────────────────────────────
  sessionTypes: [
    { id: 'qualifying',  name: 'Qualifying',  icon: '⏱️' },
    { id: 'sprint',      name: 'Sprint Race',  icon: '🏁' },
    { id: 'endurance',   name: 'Endurance',    icon: '🕐' },
  ],

  // ── SÉRIES ───────────────────────────────────────────────
  series: [
    { id: 'wec',    name: 'WEC' },
    { id: 'elms',   name: 'ELMS' },
    { id: 'custom', name: 'Custom / Outro' },
  ],

  // ── HELPERS ──────────────────────────────────────────────
  getCarsByClass(classId) {
    return this.cars.filter(c => c.class === classId);
  },

  getCarById(carId) {
    return this.cars.find(c => c.id === carId);
  },

  getTrackById(trackId) {
    return this.tracks.find(t => t.id === trackId);
  },

  getClassById(classId) {
    return this.classes.find(c => c.id === classId);
  },

  classHasABS(classId) {
    const cls = this.getClassById(classId);
    return cls ? cls.hasABS : true;
  },
};
