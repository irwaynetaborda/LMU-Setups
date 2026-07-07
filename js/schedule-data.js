// ============================================================
//  LMU SETUPS — schedule-data.js
//  Dados estáticos para o mural de corridas (Season 11 - Atualizado)
// ============================================================

const SCHEDULE_DATA = {
  season: "Temporada 11",
  dateFrom: "7 de Julho de 2026",
  
  daily: [
    // ── INICIANTE (BRONZE) ──
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LMGT3 Fixo",
      track: "Fuji (WEC)",
      classes: ["GT3"],
      duration: "20 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "ALTO",
      warmers: "LIGADO",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LOGITECH MCLAREN G CHALLENGE Q5",
      track: "Monza (WEC)",
      classes: ["GT3"],
      duration: "20 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "ALTO",
      warmers: "LIGADO",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LMP3 Fixo",
      track: "Portimao (WEC)",
      classes: ["P3"],
      duration: "20 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "ALTO",
      warmers: "LIGADO",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },

    // ── INTERMEDIÁRIO (PRATA) ──
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Inicia a cada 20 min",
      title: "LMGT3 Sprint Cup",
      track: "Bahrain (Outer)",
      classes: ["GT3"],
      duration: "30 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "BAIXO",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-silver"
    },
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Inicia a cada 20 min",
      title: "Prototype Fixo",
      track: "Le Mans (WEC)",
      classes: ["P2", "P3"],
      duration: "30 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "BAIXO",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Fixed",
      theme: "theme-silver"
    },
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Inicia a cada 20 min",
      title: "ELMS Sprint Trophy",
      track: "Barcelona (ELMS)",
      classes: ["P2", "P3", "GT3"],
      duration: "30 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "BAIXO",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-silver"
    },

    // ── AVANÇADO (OURO) ──
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "One Stint Sprint",
      track: "Interlagos (WEC)",
      classes: ["HY", "GT3"],
      duration: "40 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-gold"
    },
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "ELMS Super 60",
      track: "Imola (ELMS)",
      classes: ["P2", "P3", "GT3"],
      duration: "60 MIN",
      fuel: "Variado", // P2: Full, P3: 70L, GT3: 75% VE
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-gold"
    },
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "WEC-Xperience",
      track: "Qatar (WEC)",
      classes: ["HY", "GT3"],
      duration: "60 MIN",
      fuel: "75% VE Limit",
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-gold"
    }
  ],

  weekly: [
    {
      sr: "S2",
      rankClass: "silver",
      frequency: "Dias Específicos",
      title: "WEC Weekly",
      track: "Monza (WEC)",
      classes: ["HY", "GT3"],
      duration: "100 MIN",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-silver",
      times: "Terça, Quarta e Domingo @ 21:00 / Quarta, Quinta e Segunda @ 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00 (Horário de Brasília)"
    }
  ],

  special: [
    {
      sr: "B2", // No Rookie or Danger badges permitted
      rankClass: "bronze",
      frequency: "Dias Específicos",
      title: "ELMS 4 Hours of Imola",
      track: "Imola (ELMS)",
      classes: ["P2", "P3", "GT3"],
      duration: "240 MIN",
      fuel: "100%",
      tyresLimit: "14",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      relay: "Sim",
      theme: "theme-bronze",
      times: "Sexta, Sábado e Domingo @ 00:00, 05:00, 10:00, 15:00, 20:00 (Horário de Brasília)"
    }
  ]
};
