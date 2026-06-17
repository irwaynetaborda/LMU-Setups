// ============================================================
//  LMU SETUPS — storage.js
//  CRUD completo via Supabase (com fallback para localStorage)
// ============================================================

const Storage = {
  KEY: 'lmu_setups',

  /** Retorna todos os setups */
  async getAll() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('setups')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(row => this._mapFromDb(row));
      } catch (err) {
        console.error("[Supabase] Erro ao buscar setups do banco:", err);
        return this._getAllLocal();
      }
    }
    return this._getAllLocal();
  },

  /** Salva um novo setup */
  async save(setup) {
    const newSetup = {
      ...setup,
      id: setup.id || this._uuid(),
      createdAt: setup.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const dbRow = this._mapToDb(newSetup);
        const { error } = await supabaseClient
          .from('setups')
          .insert([dbRow]);
        if (error) throw error;
        return newSetup;
      } catch (err) {
        console.error("[Supabase] Erro ao salvar setup no banco:", err);
      }
    }

    // Fallback local
    const all = this._getAllLocal();
    all.unshift(newSetup);
    this._persist(all);
    return newSetup;
  },

  /** Atualiza um setup existente por id */
  async update(id, updates) {
    const updatedSetup = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (supabaseClient) {
      try {
        const dbRow = this._mapToDb(updatedSetup);
        // Remove id e created_at para evitar sobrescrever a chave primária ou data de criação original
        delete dbRow.id;
        delete dbRow.created_at;

        const { error } = await supabaseClient
          .from('setups')
          .update(dbRow)
          .eq('id', id);
        if (error) throw error;
        return { id, ...updatedSetup };
      } catch (err) {
        console.error("[Supabase] Erro ao atualizar setup no banco:", err);
      }
    }

    // Fallback local
    const all = this._getAllLocal();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updatedSetup };
    this._persist(all);
    return all[idx];
  },

  /** Remove um setup por id */
  async delete(id) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('setups')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("[Supabase] Erro ao deletar setup no banco:", err);
      }
    }

    // Fallback local
    const filtered = this._getAllLocal().filter(s => s.id !== id);
    this._persist(filtered);
  },

  /** Busca um setup por id */
  async getById(id) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('setups')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return this._mapFromDb(data);
      } catch (err) {
        console.error("[Supabase] Erro ao buscar setup por id:", err);
        return this._getAllLocal().find(s => s.id === id) || null;
      }
    }
    return this._getAllLocal().find(s => s.id === id) || null;
  },

  /** Importa setups de um arquivo JSON */
  async importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) return false;

      if (supabaseClient) {
        try {
          const dbRows = data.map(s => this._mapToDb(s));
          const { error } = await supabaseClient
            .from('setups')
            .upsert(dbRows);
          if (error) throw error;
          return true;
        } catch (err) {
          console.error("[Supabase] Erro ao importar JSON no banco:", err);
        }
      }

      this._persist(data);
      return true;
    } catch {
      return false;
    }
  },

  /** Retorna estatísticas dos setups fornecidos */
  getStats(all = []) {
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
  _getAllLocal() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

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

  _mapToDb(s) {
    return {
      id: s.id,
      class_id: s.classId,
      car_id: s.carId,
      car_year: s.carYear,
      track_id: s.trackId,
      track_layout: s.trackLayout,
      condition: s.condition,
      session_type: s.sessionType,
      series: s.series,
      brake_bias: s.brakeBias,
      tc: s.tc,
      tc_power_cut: s.tcPowerCut,
      tc_slip_angle: s.tcSlipAngle,
      abs: s.abs,
      brake_pressure: s.brakePressure,
      laptime: s.laptime,
      date: s.date,
      rating: s.rating,
      notes: s.notes,
      created_at: s.createdAt,
      updated_at: s.updatedAt
    };
  },

  _mapFromDb(d) {
    return {
      id: d.id,
      classId: d.class_id,
      carId: d.car_id,
      carYear: d.car_year,
      trackId: d.track_id,
      trackLayout: d.track_layout,
      condition: d.condition,
      sessionType: d.session_type,
      series: d.series,
      brakeBias: d.brake_bias ? parseFloat(d.brake_bias) : null,
      tc: d.tc,
      tcPowerCut: d.tc_power_cut,
      tcSlipAngle: d.tc_slip_angle,
      abs: d.abs,
      brakePressure: d.brake_pressure,
      laptime: d.laptime,
      date: d.date,
      rating: d.rating,
      notes: d.notes,
      createdAt: d.created_at || d.created_at,
      updatedAt: d.updated_at || d.updated_at
    };
  }
};
