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
          .eq('active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = data.map(row => this._mapFromDb(row));
        // Salva cópia local para leitura offline
        this._persist(mapped);
        return mapped;
      } catch (err) {
        console.error("[Supabase] Erro ao buscar setups do banco:", err);
        return this._getAllLocal().filter(s => s.active !== false);
      }
    }
    return this._getAllLocal().filter(s => s.active !== false);
  },

  /** Salva um novo setup */
  async save(setup) {
    if (!supabaseClient) {
      throw new Error("O servidor do banco de dados não está disponível.");
    }

    const activeUsername = (typeof Auth !== 'undefined') ? Auth.getUsername() : null;
    const newSetup = {
      ...setup,
      id: setup.id || this._uuid(),
      creatorUsername: setup.creatorUsername || activeUsername || 'Piloto',
      votes: setup.votes !== undefined ? setup.votes : 0,
      createdAt: setup.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dbRow = this._mapToDb(newSetup);
    // Injeta o user_id do usuário logado
    const userId = (typeof Auth !== 'undefined') ? Auth.getUser()?.id : null;
    if (userId) dbRow.user_id = userId;

    const { error } = await supabaseClient
      .from('setups')
      .insert([dbRow]);
    if (error) throw error;

    // Sincroniza cache local
    const all = this._getAllLocal();
    all.unshift(newSetup);
    this._persist(all);

    return newSetup;
  },

  /** Atualiza um setup existente por id */
  async update(id, updates) {
    if (!supabaseClient) {
      throw new Error("O servidor do banco de dados não está disponível.");
    }

    const updatedSetup = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const dbRow = this._mapToDb(updatedSetup);
    // Remove id e created_at para evitar sobrescrever a chave primária ou data de criação original
    // Remove também campos do criador e contagem de votos para evitar resetá-los na edição
    delete dbRow.id;
    delete dbRow.created_at;
    delete dbRow.creator_username;
    delete dbRow.user_id;
    delete dbRow.votes;

    const { error } = await supabaseClient
      .from('setups')
      .update(dbRow)
      .eq('id', id);
    if (error) throw error;

    // Sincroniza cache local
    const all = this._getAllLocal();
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1) {
      // Remove chaves undefined para não corromper o cache local
      const cleanUpdates = {};
      Object.keys(updatedSetup).forEach(k => {
        if (updatedSetup[k] !== undefined) {
          cleanUpdates[k] = updatedSetup[k];
        }
      });
      // Protege campos no cache local
      delete cleanUpdates.id;
      delete cleanUpdates.createdAt;
      delete cleanUpdates.creatorUsername;
      delete cleanUpdates.userId;
      delete cleanUpdates.votes;

      all[idx] = { ...all[idx], ...cleanUpdates };
      this._persist(all);
    }
    return { id, ...updatedSetup };
  },

  /** Remove um setup por id (soft delete: altera active para false) */
  async delete(id) {
    if (!supabaseClient) {
      throw new Error("O servidor do banco de dados não está disponível.");
    }

    const { error } = await supabaseClient
      .from('setups')
      .update({ active: false })
      .eq('id', id);
    if (error) throw error;

    // Sincroniza cache local
    const all = this._getAllLocal();
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1) {
      all[idx].active = false;
      this._persist(all);
    }
  },

  /** Busca um setup por id */
  async getById(id) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('setups')
          .select('*')
          .eq('id', id)
          .eq('active', true)
          .single();
        if (error) throw error;
        return this._mapFromDb(data);
      } catch (err) {
        console.error("[Supabase] Erro ao buscar setup por id:", err);
        const local = this._getAllLocal().find(s => s.id === id);
        return (local && local.active !== false) ? local : null;
      }
    }
    const local = this._getAllLocal().find(s => s.id === id);
    return (local && local.active !== false) ? local : null;
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

    const byBrand = {};
    all.forEach(s => {
      const car = LMU_DATA.getCarById(s.carId);
      if (car && car.brand) {
        byBrand[car.brand] = (byBrand[car.brand] || 0) + 1;
      }
    });

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
      byBrand,
      avgRating,
      topTrack: topTrack ? topTrack.shortName : '—',
      topTrackId: topTrackId || null,
      topTrackName: topTrack ? topTrack.name : null,
    };
  },

  /** Retorna todos os feedbacks de um setup */
  async getComments(setupId) {
    if (!supabaseClient) {
      return [];
    }
    try {
      const { data, error } = await supabaseClient
        .from('setup_comments')
        .select('*')
        .eq('setup_id', setupId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(c => ({
        id: c.id,
        setupId: c.setup_id,
        userId: c.user_id,
        username: c.username,
        comment: c.comment,
        likes: c.likes || 0,
        createdAt: c.created_at
      }));
    } catch (err) {
      console.error("[Supabase] Erro ao buscar feedbacks:", err);
      return [];
    }
  },

  /** Adiciona um novo feedback */
  async addComment(setupId, commentText) {
    if (!supabaseClient) {
      throw new Error("O servidor de banco de dados não está disponível.");
    }
    const username = (typeof Auth !== 'undefined') ? Auth.getUsername() : 'Piloto';
    const userId = (typeof Auth !== 'undefined') ? Auth.getUser()?.id : null;

    if (!userId) {
      throw new Error("Você precisa estar logado para comentar.");
    }

    const newCommentId = this._uuid();
    const { error } = await supabaseClient
      .from('setup_comments')
      .insert([{
        id: newCommentId,
        setup_id: setupId,
        user_id: userId,
        username: username || 'Piloto',
        comment: commentText,
        likes: 0
      }]);
    if (error) throw error;

    return {
      id: newCommentId,
      setupId,
      userId,
      username: username || 'Piloto',
      comment: commentText,
      likes: 0,
      createdAt: new Date().toISOString()
    };
  },

  /** Altera curtidas do feedback */
  async likeComment(commentId, diff) {
    if (!supabaseClient) {
      throw new Error("O servidor de banco de dados não está disponível.");
    }
    const rpcName = diff > 0 ? 'increment_comment_likes' : 'decrement_comment_likes';
    const { error } = await supabaseClient.rpc(rpcName, { comment_id: commentId });
    if (error) throw error;
  },

  /** Deleta um feedback */
  async deleteComment(commentId) {
    if (!supabaseClient) {
      throw new Error("O servidor de banco de dados não está disponível.");
    }
    const { error } = await supabaseClient
      .from('setup_comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  },

  // ── Upload do arquivo .svm para o Supabase Storage ────────
  async uploadSvmFile(file, userId, setupId) {
    if (!supabaseClient) return null;
    try {
      const folder = `${userId}/${setupId}`;
      const path = `${folder}/setup.svm`;

      // Remove arquivos antigos da pasta (evita arquivos órfãos com nomes diferentes)
      const { data: existingFiles } = await supabaseClient.storage
        .from('setup-files')
        .list(folder);
      if (existingFiles && existingFiles.length > 0) {
        const toDelete = existingFiles.map(f => `${folder}/${f.name}`);
        await supabaseClient.storage.from('setup-files').remove(toDelete);
      }

      // Faz o upload do novo arquivo com caminho fixo
      const { error } = await supabaseClient.storage
        .from('setup-files')
        .upload(path, file, { contentType: 'application/octet-stream' });
      if (error) throw error;

      const { data } = supabaseClient.storage
        .from('setup-files')
        .getPublicUrl(path);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('[Storage] Erro ao fazer upload do .svm:', err);
      return null;
    }
  },

  // ── Salva a URL do .svm no registro do setup ────────────────
  async saveSvmUrl(setupId, url) {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('setups')
        .update({ svm_file_url: url })
        .eq('id', setupId);
      if (error) throw error;
    } catch (err) {
      console.error('[Storage] Erro ao salvar URL do .svm:', err);
    }
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
    const parseNum = (val, isFloat = false) => {
      if (val === 'Linked' || val === 'linked') return null;
      const parsed = isFloat ? parseFloat(val) : parseInt(val);
      return isNaN(parsed) ? null : parsed;
    };

    return {
      id: s.id,
      user_id: s.userId || null,
      class_id: s.classId,
      car_id: s.carId,
      car_year: s.carYear,
      track_id: s.trackId,
      track_layout: s.trackLayout,
      condition: s.condition,
      session_type: s.sessionType,
      series: s.series,
      brake_bias: parseNum(s.brakeBias, true),
      tc: parseNum(s.tc),
      tc_power_cut: parseNum(s.tcPowerCut),
      tc_slip_angle: parseNum(s.tcSlipAngle),
      abs: parseNum(s.abs),
      brake_pressure: parseNum(s.brakePressure),
      laptime: s.laptime,
      date: s.date,
      rating: parseNum(s.rating),
      notes: s.notes,
      is_public: s.isPublic !== undefined ? s.isPublic : true,
      creator_username: s.creatorUsername || null,
      votes: parseNum(s.votes) || 0,
      setup_type: s.setupType || 'fixed',
      open_params: s.openParams || null,
      car_version: s.carVersion || null,
      active: s.active !== undefined ? s.active : true,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      svm_file_url: s.svmFileUrl || null,
    };
  },

  _mapFromDb(d) {
    const isLinkedClass = d.class_id === 'lmp2' || d.class_id === 'lmp3';
    return {
      id: d.id,
      userId: d.user_id,
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
      tcSlipAngle: (d.tc_slip_angle === null && isLinkedClass) ? 'Linked' : d.tc_slip_angle,
      abs: d.abs,
      brakePressure: d.brake_pressure,
      laptime: d.laptime,
      date: d.date,
      rating: d.rating,
      notes: d.notes,
      isPublic: d.is_public !== undefined ? d.is_public : true,
      creatorUsername: d.creator_username || 'Piloto',
      votes: d.votes !== undefined ? d.votes : 0,
      setupType: d.setup_type || 'fixed',
      openParams: d.open_params || null,
      carVersion: d.car_version || null,
      active: d.active !== undefined ? d.active : true,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      svmFileUrl: d.svm_file_url || null,
    };
  },
};
