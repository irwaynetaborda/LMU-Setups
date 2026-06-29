// ============================================================
//  LMU SETUPS â€” schedule-data.js
//  Dados estÃ¡ticos para o mural de corridas (Season 11 - Atualizado)
// ============================================================

const SCHEDULE_DATA = {
  season: "Temporada 11",
  dateFrom: "30 de Junho de 2026",
  
  daily: [
    // â”€â”€ INICIANTE (BRONZE) â”€â”€
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LMGT3 Fixo",
      track: "Sebring (School)",
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
      track: "Fuji (Classic)",
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

    // â”€â”€ INTERMEDIÃRIO (PRATA) â”€â”€
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Inicia a cada 20 min",
      title: "LMGT3 Sprint Cup",
      track: "COTA (National)",
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
      title: "ProtÃ³tipo Fixo",
      track: "Barcelona (ELMS)",
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
      track: "Portimao (WEC)",
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

    // â”€â”€ AVANÃ‡ADO (OURO) â”€â”€
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "One Stint Sprint",
      track: "Paul Ricard (Layout 1A)",
      classes: ["HY", "GT3"],
      duration: "40 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-gold"
    },
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "ELMS Super 60",
      track: "Spa (ELMS)",
      classes: ["P2", "P3", "GT3"],
      duration: "60 MIN",
      fuel: "Variado",
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-gold"
    },
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Inicia a cada 30 min",
      title: "WEC-Xperience",
      track: "Silverstone (ELMS)",
      classes: ["HY", "GT3"],
      duration: "60 MIN",
      fuel: "75% VE",
      tyresLimit: "8",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-gold"
    }
  ],

  weekly: [
    {
      sr: "S2",
      rankClass: "silver",
      frequency: "Dias EspecÃ­ficos",
      title: "WEC Semanal",
      track: "Portimao (ELMS)",
      classes: ["HY", "GT3"],
      duration: "100 MIN",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-silver",
      times: "Ter Qua Qui Sex SÃ¡b Dom @ 23:00 / Qua Qui Sex SÃ¡b Dom Seg @ 03:00, 06:00, 09:00, 12:00, 15:00, 17:00, 20:00 (HorÃ¡rio de BrasÃ­lia)"
    }
  ],

  special: [
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Dias EspecÃ­ficos",
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
      times: "Sex SÃ¡b Dom @ 02:00, 08:00, 14:00, 19:00 (HorÃ¡rio de BrasÃ­lia)"
    }
  ]
};
