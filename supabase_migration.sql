-- ============================================================
-- MIGRATION: LMU Setups - Creator and Votes Columns
-- Execute este script no painel "SQL Editor" do seu Supabase.
-- ============================================================

-- 1. Adiciona coluna para o nome de usuário do criador
ALTER TABLE setups ADD COLUMN IF NOT EXISTS creator_username TEXT;

-- 2. Adiciona coluna para contagem de votos do setup
ALTER TABLE setups ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;

-- 3. Cria a função RPC para incrementar votos ignorando RLS
-- Isso permite que qualquer pessoa vote sem precisar de permissões de escrita de linha inteira
CREATE OR REPLACE FUNCTION increment_votes(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE setups
  SET votes = COALESCE(votes, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cria a função RPC para decrementar votos ignorando RLS
CREATE OR REPLACE FUNCTION decrement_votes(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE setups
  SET votes = GREATEST(COALESCE(votes, 0) - 1, 0)
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
