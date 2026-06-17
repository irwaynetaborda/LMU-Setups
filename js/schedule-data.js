// ============================================================
//  LMU SETUPS — schedule-data.js
//  Dados estáticos para o mural de corridas (Season 11)
// ============================================================

const SCHEDULE_DATA = {
  season: "Season 11",
  dateFrom: "16th June 2026",
  
  daily: [
    // ── BEGINNER ──
    {
      sr: "BRONZE",
      rankClass: "bronze",
      frequency: "Starts every 15m",
      title: "LMGT3 FIXED",
      track: "Spa-Francorchamps (WEC)",
      classes: ["GT3"],
      duration: "20 MIN",
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
      title: "LOGITECH G CHALLENGE",
      track: "Le Mans (WEC)",
      classes: ["GT3"], // McLaren 720S
      duration: "20 MIN",
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
      title: "LMP3 FIXED",
      track: "Bahrain (WEC)",
      classes: ["P3"],
      duration: "20 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "HIGH",
      warmers: "ON",
      splits: "20",
      setup: "Fixed",
      theme: "theme-bronze"
    },

    // ── INTERMEDIATE ──
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Starts every 20m",
      title: "LMGT3 SPRINT CUP",
      track: "Interlagos (WEC)",
      classes: ["GT3"],
      duration: "30 MIN",
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
      duration: "30 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "LOW",
      warmers: "OFF",
      splits: "38",
      setup: "Fixed",
      theme: "theme-silver"
    },
    {
      sr: "SILVER",
      rankClass: "silver",
      frequency: "Starts every 20m",
      title: "ELMS SPRINT TROPHY",
      track: "Sebring (WEC)",
      classes: ["P2", "P3", "GT3"],
      duration: "30 MIN",
      fuel: "100%",
      tyresLimit: "8",
      assists: "LOW",
      warmers: "OFF",
      splits: "38",
      setup: "Open",
      theme: "theme-silver"
    },

    // ── ADVANCED ──
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
      title: "ELMS SUPER 60",
      track: "Barcelona (ELMS)",
      classes: ["P2", "P3", "GT3"],
      duration: "60 MIN",
      fuel: "Limited", // P2 full, P3 70L, GT3 75%
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
      duration: "100 MIN",
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
      duration: "90 MIN",
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
