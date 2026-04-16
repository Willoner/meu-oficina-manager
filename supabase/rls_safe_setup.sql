-- =============================================================================
-- rls_safe_setup.sql
-- Ativa RLS e cria políticas SOMENTE nas tabelas que possuem a coluna correta.
-- Detecta automaticamente: usuario_id | user_id | cliente_id
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor > New Query)
-- =============================================================================

DO $$
DECLARE
  rec         RECORD;
  col_name    TEXT;
  policy_name TEXT;
BEGIN

  -- -----------------------------------------------------------------------
  -- Itera sobre todas as tabelas do schema public
  -- -----------------------------------------------------------------------
  FOR rec IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type   = 'BASE TABLE'
    ORDER BY table_name
  LOOP

    -- Detecta qual coluna de usuário existe nesta tabela (prioridade: usuario_id > user_id > cliente_id)
    col_name := NULL;

    SELECT column_name INTO col_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = rec.table_name
      AND column_name  IN ('usuario_id', 'user_id', 'cliente_id')
    ORDER BY
      CASE column_name
        WHEN 'usuario_id' THEN 1
        WHEN 'user_id'    THEN 2
        WHEN 'cliente_id' THEN 3
      END
    LIMIT 1;

    -- Só age se a coluna foi encontrada
    IF col_name IS NOT NULL THEN

      RAISE NOTICE 'Tabela: % | Coluna detectada: %', rec.table_name, col_name;

      -- 1. Ativa RLS na tabela
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', rec.table_name);

      -- 2. Remove políticas antigas (evita conflito de nome)
      policy_name := 'rls_isolamento_' || rec.table_name;

      EXECUTE format(
        'DROP POLICY IF EXISTS %L ON public.%I;',
        policy_name,
        rec.table_name
      );

      -- 3. Cria a política ALL usando a coluna correta encontrada
      EXECUTE format(
        'CREATE POLICY %L ON public.%I
           FOR ALL
           USING (auth.uid() = %I)
           WITH CHECK (auth.uid() = %I);',
        policy_name,
        rec.table_name,
        col_name,
        col_name
      );

      RAISE NOTICE '  → RLS ativado e política criada com coluna %', col_name;

    ELSE
      RAISE NOTICE 'Tabela: % | Sem coluna de isolamento detectada — RLS ignorado.', rec.table_name;
    END IF;

  END LOOP;

END;
$$;


-- =============================================================================
-- VERIFICAÇÃO: lista as tabelas com RLS ativo e suas políticas
-- =============================================================================
SELECT
  c.relname                              AS tabela,
  c.relrowsecurity                       AS rls_ativo,
  p.polname                              AS politica,
  p.polcmd                               AS operacao,
  pg_get_expr(p.polqual, c.oid)          AS using_expr,
  pg_get_expr(p.polwithcheck, c.oid)     AS with_check_expr
FROM pg_class c
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
ORDER BY c.relname, p.polname;
