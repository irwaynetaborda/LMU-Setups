// ============================================================
//  LMU SETUPS — schedule-data.js
//  Dados estáticos para o mural de corridas (Season 11)
// ============================================================

const SCHEDULE_DATA = {
  season: "Season 11",
  dateFrom: "16th June 2026",
  
  daily: [
    // ── BEGINNER (BRONZE) ──
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Starts every 15m",
      title: "LMGT3 FIXED",
      track: "Spa-Francorchamps (WEC)",
      classes: ["GT3"],
      duration: "35 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "HIGH",
      warmers: "ON",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Starts every 15m",
      title: "LOGITECH MCLAREN G CHALLENGE Q4",
      track: "Circuit de la Sarthe",
      classes: ["GT3"],
      duration: "34 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "HIGH",
      warmers: "ON",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },

    // ── INTERMEDIATE (SILVER) ──
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Starts every 20m",
      title: "LMGT3 SPRINT CUP",
      track: "Interlagos (WEC)",
      classes: ["GT3"],
      duration: "45 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "LOW",
      warmers: "OFF",
      splits: "38",
      setup: "Open",
      theme: "theme-silver"
    },
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Starts every 20m",
      title: "PROTOTYPE FIXED",
      track: "Silverstone (WEC)",
      classes: ["P2", "P3"],
      duration: "45 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "LOW",
      warmers: "OFF",
      splits: "38",
      setup: "Fixed",
      theme: "theme-silver"
    },

    // ── ADVANCED (GOLD) ──
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Starts every 30m",
      title: "ONE STINT SPRINT",
      track: "Monza (WEC)",
      classes: ["HY", "GT3"],
      duration: "40 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "NONE",
      warmers: "OFF",
      splits: "38",
      setup: "Open",
      theme: "theme-gold"
    },
    {
      sr: "GOLD",
      rankClass: "gold",
      frequency: "Starts every 30m",
      title: "WEC-XPERIENCE",
      track: "Fuji (Classic)",
      classes: ["HY", "GT3"],
      duration: "60 MIN",
      fuel: "75% VE",
      tyresLimit: "8",
      assists: "NONE",
      warmers: "OFF",
      splits: "38",
      setup: "Open",
      theme: "theme-gold"
    }
  ],

  weekly: [
    {
      sr: "S2",
      rankClass: "silver",
      frequency: "Specific Days",
      title: "WEC WEEKLY",
      track: "Silverstone (ELMS)",
      classes: ["HY", "GT3"],
      duration: "2 HOURS",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NONE",
      warmers: "OFF",
      splits: "44",
      setup: "Open",
      theme: "theme-silver",
      times: "Wed Fri Sun @ 02:00, 06:00, 09:00, 12:00, 15:00, 18:00, 20:00, 23:00 UTC"
    },
    {
      sr: "B3",
      rankClass: "bronze",
      frequency: "Specific Days",
      title: "PROTOTYPE CHALLENGE",
      track: "Portimao (ELMS)",
      classes: ["P2", "P3"],
      duration: "1H 50M",
      fuel: "100%",
      tyresLimit: "10",
      assists: "NONE",
      warmers: "OFF",
      splits: "44",
      setup: "Open",
      theme: "theme-bronze",
      times: "Thu Sat Mon @ 02:00, 06:00, 09:00, 12:00, 15:00, 18:00, 20:00, 23:00 UTC"
    }
  ]
};
