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

-- ============================================================
-- MIGRATION: LMU Setups - Soft deletes support (active column)
-- ============================================================

-- 8. Adiciona coluna active para soft delete (ocultar do site sem deletar do banco)
ALTER TABLE setups ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 9. Habilita RLS na tabela setups e cria políticas completas de segurança
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;

-- Limpa dinamicamente TODAS as políticas antigas/padrão existentes para evitar conflitos (onde políticas se somam com OR)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename IN ('setups', 'setup_comments')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;
CREATE POLICY "Qualquer um pode ver setups ativos" ON setups
  FOR SELECT
  TO public
  USING (active = true OR auth.uid() = user_id);

-- 9.2 Política de criação: Apenas usuários autenticados criam setups sob o seu próprio ID
-- e com o creator_username correspondente ao seu email real para evitar falsificação
DROP POLICY IF EXISTS "Usuarios logados podem criar setups" ON setups;
CREATE POLICY "Usuarios logados podem criar setups" ON setups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND lower(creator_username) = split_part(auth.jwt() ->> 'email', '@', 1)
  );

-- 9.3 Política de edição: Apenas o dono ou o admin 'taborda' podem editar
DROP POLICY IF EXISTS "Donos e admin podem atualizar setups" ON setups;
CREATE POLICY "Donos e admin podem atualizar setups" ON setups
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR split_part(auth.jwt() ->> 'email', '@', 1) = 'taborda'
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR split_part(auth.jwt() ->> 'email', '@', 1) = 'taborda'
  );

-- 9.4 Política de exclusão física: Apenas dono ou admin 'taborda'
DROP POLICY IF EXISTS "Donos e admin podem deletar setups" ON setups;
CREATE POLICY "Donos e admin podem deletar setups" ON setups
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR split_part(auth.jwt() ->> 'email', '@', 1) = 'taborda'
  );

-- ============================================================
-- MIGRATION: LMU Setups - Community Feedbacks / Comments
-- ============================================================

-- 10. Cria a tabela de feedbacks da comunidade
CREATE TABLE IF NOT EXISTS setup_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id TEXT REFERENCES setups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita RLS para a tabela de comentários
ALTER TABLE setup_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para setup_comments
DROP POLICY IF EXISTS "Qualquer um pode ler comentarios" ON setup_comments;
CREATE POLICY "Qualquer um pode ler comentarios" ON setup_comments
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Usuarios logados podem criar comentarios" ON setup_comments;
CREATE POLICY "Usuarios logados podem criar comentarios" ON setup_comments
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id
    AND lower(username) = split_part(auth.jwt() ->> 'email', '@', 1)
  );

DROP POLICY IF EXISTS "Usuarios logados podem deletar seus proprios comentarios" ON setup_comments;
CREATE POLICY "Usuarios logados podem deletar seus proprios comentarios" ON setup_comments
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id
    OR split_part(auth.jwt() ->> 'email', '@', 1) = 'taborda'
  );

-- 11. RPC para incrementar curtidas dos comentários ignorando RLS
DROP FUNCTION IF EXISTS increment_comment_likes(UUID);
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE setup_comments
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RPC para decrementar curtidas dos comentários ignorando RLS
DROP FUNCTION IF EXISTS decrement_comment_likes(UUID);
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE setup_comments
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


