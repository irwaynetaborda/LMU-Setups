// ============================================================
//  LMU SETUPS — storage.js
//  CRUD completo via localStorage
// ============================================================

const Storage = {
  KEY: 'lmu_setups',

  /** Retorna todos os setups */
  getAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Salva um novo setup e retorna ele com id/createdAt */
  save(setup) {
    const all = this.getAll();
    const newSetup = {
      ...setup,
      id: this._uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(newSetup); // mais recente primeiro
    this._persist(all);
    return newSetup;
  },

  /** Atualiza um setup existente por id */
  update(id, updates) {
    const all = this.getAll();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    this._persist(all);
    return all[idx];
  },

  /** Remove um setup por id */
  delete(id) {
    const filtered = this.getAll().filter(s => s.id !== id);
    this._persist(filtered);
  },

  /** Busca um setup por id */
  getById(id) {
    return this.getAll().find(s => s.id === id) || null;
  },



  /** Importa setups de um arquivo JSON */
  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) return false;
      this._persist(data);
      return true;
    } catch {
      return false;
    }
  },

  /** Retorna estatísticas dos setups */
  getStats() {
    const all = this.getAll();
    const byClass = {};
    LMU_DATA.classes.forEach(c => { byClass[c.id] = 0; });
    all.forEach(s => { if (byClass[s.classId] !== undefined) byClass[s.classId]++; });

    const avgRating = all.length
      ? (all.reduce((sum, s) => sum + (s.rating || 0), 0) / all.length).toFixed(1)
      : '—';

    const trackCounts = {};
    all.forEach(s => {
      trackCounts[s.trackId] = (trackCounts[s.trackId] || 0) + 1;
    });
    const topTrackId = Object.keys(trackCounts).sort((a, b) => trackCounts[b] - trackCounts[a])[0];
    const topTrack = topTrackId ? LMU_DATA.getTrackById(topTrackId) : null;

    return {
      total: all.length,
      byClass,
      avgRating,
      topTrack: topTrack ? topTrack.shortName : '—',
    };
  },

  // ── Internos ────────────────────────────────────────────
  _persist(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  _uuid() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
  },
};
