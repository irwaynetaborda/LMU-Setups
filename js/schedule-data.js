// ============================================================
//  LMU SETUPS — schedule-data.js
//  Dados estáticos para o mural de corridas (Season 11)
// ============================================================

const SCHEDULE_DATA = {
  season: "Temporada 11",
  dateFrom: "16 de Junho de 2026",
  
  daily: [
    // ── INICIANTE (BRONZE) ──
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Inicia a cada 15 min",
      title: "LMGT3 Fixo",
      track: "Spa-Francorchamps (WEC)",
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
      track: "Bahrain (WEC)",
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
      track: "Interlagos (WEC)",
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
      track: "Silverstone (WEC)",
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
      track: "Sebring (WEC)",
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
      track: "Monza (WEC)",
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
      track: "Barcelona (ELMS)",
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
      track: "Fuji (Classic)",
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
      sr: "S2",
      rankClass: "silver",
      frequency: "Dias Específicos",
      title: "WEC Semanal",
      track: "Silverstone (ELMS)",
      classes: ["HY", "GT3"],
      duration: "100 MIN",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-silver",
      times: "Qua Sex Dom @ 02:00, 06:00, 09:00, 12:00, 15:00, 18:00, 20:00, 23:00 UTC"
    },
    {
      sr: "B3",
      rankClass: "bronze",
      frequency: "Dias Específicos",
      title: "Desafio de Protótipos",
      track: "Portimao (ELMS)",
      classes: ["P2", "P3"],
      duration: "90 MIN",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NENHUMA",
      warmers: "DESLIGADO",
      splits: "44",
      setup: "Open",
      theme: "theme-bronze",
      times: "Qui Sáb Seg @ 02:00, 06:00, 09:00, 12:00, 15:00, 18:00, 20:00, 23:00 UTC"
    }
  ]
};
