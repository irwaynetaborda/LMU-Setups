-- ============================================================
-- MIGRATION: LMU Setups - Creator and Votes Columns
-- Execute este script no painel "SQL Editor" do seu Supabase.
-- ============================================================

-- 1. Adiciona coluna para o nome de usuário do criador
ALTER TABLE setups ADD COLUMN IF NOT EXISTS creator_username TEXT;

-- 2. Adiciona coluna para contagem de votos do setup
ALTER TABLE setups ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;

-- 3. Limpa e cria a função RPC para incrementar votos ignorando RLS
-- Remove assinaturas duplicadas antigas para evitar ambiguidade (Erro 300)
DROP FUNCTION IF EXISTS increment_votes(UUID);
DROP FUNCTION IF EXISTS increment_votes(TEXT);

CREATE OR REPLACE FUNCTION increment_votes(row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE setups
  SET votes = COALESCE(votes, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Limpa e cria a função RPC para decrementar votos ignorando RLS
DROP FUNCTION IF EXISTS decrement_votes(UUID);
DROP FUNCTION IF EXISTS decrement_votes(TEXT);

CREATE OR REPLACE FUNCTION decrement_votes(row_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE setups
  SET votes = GREATEST(COALESCE(votes, 0) - 1, 0)
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MIGRATION: LMU Setups - Open setups support (.svm)
-- ============================================================

-- 5. Adiciona coluna setup_type (fixed ou open)
ALTER TABLE setups ADD COLUMN IF NOT EXISTS setup_type TEXT DEFAULT 'fixed';

-- 6. Adiciona coluna open_params (dados estruturados do arquivo .svm)
ALTER TABLE setups ADD COLUMN IF NOT EXISTS open_params JSONB;

-- 7. Adiciona coluna car_version (versão física/jogo do carro extraído do arquivo .svm)
ALTER TABLE setups ADD COLUMN IF NOT EXISTS car_version TEXT;

