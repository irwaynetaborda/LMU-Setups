// ============================================================
//  LMU SETUPS — schedule-data.js
//  Dados estáticos para o mural de corridas (Season 11 - Atualizado)
// ============================================================

const SCHEDULE_DATA = {
  season: "Temporada 11",
  dateFrom: "23 de Junho de 2026",
  
  daily: [
    // ── INICIANTE (BRONZE) ──
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LMGT3 Fixo",
      track: "Bahrain (Paddock)",
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
      title: "LOGITECH MCLAREN G CHALLENGE Q4",
      track: "Le Mans (WEC)",
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
      track: "Spa-Francorchamps (WEC)",
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
      track: "Monza (Curva Grande)",
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
      title: "Protótipo Fixo",
      track: "Interlagos (WEC)",
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
      track: "Qatar (WEC)",
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
      track: "COTA (WEC)",
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
      track: "Bahrain (WEC)",
      classes: ["P2", "P3", "GT3"],
      duration: "60 MIN",
      fuel: "Limitado",
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
      track: "Sebring (WEC)",
      classes: ["HY", "GT3"],
      duration: "60 MIN",
      fuel: "75% VE",
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
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Dias Específicos",
      title: "WEC Semanal",
      track: "Fuji (WEC)",
      classes: ["HY", "GT3"],
      duration: "100 MIN",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "38",
      setup: "Open",
      theme: "theme-silver",
      times: "Ter Qua Dom @ 23:00 / Qua Qui Seg @ 03:00, 06:00, 09:00, 12:00, 15:00, 17:00, 20:00 (Horário de Brasília)"
    }
  ],

  special: [
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Dias Específicos",
      title: "6 Hours of Le Mans",
      track: "Le Mans (WEC)",
      classes: ["HY", "P2", "GT3"],
      duration: "360 MIN",
      fuel: "100%",
      tyresLimit: "16",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      relay: "Sim",
      theme: "theme-bronze",
      times: "Sex Sáb Dom @ 02:00, 08:00, 14:00, 19:00 (Horário de Brasília)"
    }
  ]
};
