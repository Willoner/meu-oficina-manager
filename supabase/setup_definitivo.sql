-- ############################################################################
-- setup_definitivo.sql — Oficina em Ordem
-- Executa em UMA ÚNICA RODADA no SQL Editor do Supabase.
-- Todas as operações são idempotentes (seguro re-executar).
-- ############################################################################


-- ============================================================================
-- PASSO 1 — HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE public.usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_os       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas    ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- PASSO 2 — REMOVER TODAS AS POLÍTICAS ANTIGAS (limpeza total)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END;
$$;


-- ============================================================================
-- PASSO 3 — CRIAR POLÍTICAS RLS CORRETAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 usuarios — cada usuário acessa apenas o próprio perfil
-- ----------------------------------------------------------------------------
CREATE POLICY "usuarios_select_proprio"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "usuarios_update_proprio"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Leitura pública mínima para PublicOS.tsx (exibe nome/telefone da oficina no link)
CREATE POLICY "usuarios_leitura_publica_via_os"
  ON public.usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.usuario_id = usuarios.id
    )
  );


-- ----------------------------------------------------------------------------
-- 3.2 clientes
-- ----------------------------------------------------------------------------
CREATE POLICY "clientes_proprio_usuario"
  ON public.clientes FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Leitura pública via link de OS (PublicOS.tsx)
CREATE POLICY "clientes_leitura_publica_via_os"
  ON public.clientes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.cliente_id = clientes.id
    )
  );


-- ----------------------------------------------------------------------------
-- 3.3 veiculos
-- ----------------------------------------------------------------------------
CREATE POLICY "veiculos_proprio_usuario"
  ON public.veiculos FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Leitura pública via link de OS (PublicOS.tsx)
CREATE POLICY "veiculos_leitura_publica_via_os"
  ON public.veiculos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.veiculo_id = veiculos.id
    )
  );


-- ----------------------------------------------------------------------------
-- 3.4 ordens_servico
-- ----------------------------------------------------------------------------
CREATE POLICY "os_proprio_usuario"
  ON public.ordens_servico FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Leitura pública por UUID (cliente acessa via link único)
CREATE POLICY "os_leitura_publica_por_id_seguro"
  ON public.ordens_servico FOR SELECT
  TO anon, authenticated
  USING (
    (auth.uid() = usuario_id) OR 
    (id IS NOT NULL AND auth.uid() IS NULL)
  );


-- ----------------------------------------------------------------------------
-- 3.5 itens_os — acesso via OS do próprio usuário
-- ----------------------------------------------------------------------------
CREATE POLICY "itens_os_via_os_do_usuario"
  ON public.itens_os FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  );

-- Leitura pública via link de OS
CREATE POLICY "itens_os_leitura_publica_via_os"
  ON public.itens_os FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
    )
  );


-- ----------------------------------------------------------------------------
-- 3.6 pagamentos — acesso via OS do próprio usuário
-- ----------------------------------------------------------------------------
CREATE POLICY "pagamentos_via_os_do_usuario"
  ON public.pagamentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = pagamentos.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = pagamentos.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------------------
-- 3.7 pecas
-- ----------------------------------------------------------------------------
CREATE POLICY "pecas_proprio_usuario"
  ON public.pecas FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);


-- ----------------------------------------------------------------------------
-- 3.8 servicos
-- ----------------------------------------------------------------------------
CREATE POLICY "servicos_proprio_usuario"
  ON public.servicos FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);


-- ----------------------------------------------------------------------------
-- 3.9 configuracoes
-- ----------------------------------------------------------------------------
CREATE POLICY "configuracoes_proprio_usuario"
  ON public.configuracoes FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);


-- ----------------------------------------------------------------------------
-- 3.10 notificacoes
-- ----------------------------------------------------------------------------
CREATE POLICY "notificacoes_proprio_usuario"
  ON public.notificacoes FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);


-- ----------------------------------------------------------------------------
-- 3.11 assinaturas
-- ----------------------------------------------------------------------------
CREATE POLICY "assinaturas_proprio_usuario"
  ON public.assinaturas FOR ALL
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);


-- ============================================================================
-- PASSO 4 — TRIGGER: preenche usuario_id automaticamente no INSERT
-- Evita erro 409 quando o frontend não enviar o campo (ou enviar errado)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_set_usuario_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.usuario_id IS NULL THEN
      NEW.usuario_id := auth.uid();
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Evita que usuario_id se torne NULL em atualizações anônimas (ex: assinatura do cliente)
    IF auth.uid() IS NULL THEN
      NEW.usuario_id := OLD.usuario_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar trigger em cada tabela com usuario_id
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clientes', 'veiculos', 'ordens_servico',
    'pecas', 'servicos', 'configuracoes', 'notificacoes'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_usuario_id ON public.%I', tbl
    );
    EXECUTE format(
      'CREATE TRIGGER trg_set_usuario_id
       BEFORE INSERT ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.fn_set_usuario_id()', tbl
    );
  END LOOP;
END;
$$;


-- ============================================================================
-- PASSO 5 — TRIGGER: cria perfil em public.usuarios ao cadastrar novo usuário
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria o perfil básico (ignora se já existir)
  INSERT INTO public.usuarios (id, email, nome_oficina)
  SELECT
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_oficina', 'Minha Oficina')
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usuarios WHERE id = NEW.id
  );

  -- Cria configurações padrão (ignora se já existir)
  INSERT INTO public.configuracoes (usuario_id, moeda, formato_data, notificacoes_email)
  SELECT NEW.id, 'BRL', 'DD/MM/YYYY', true
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuracoes WHERE usuario_id = NEW.id
  );

  -- Notificação de boas-vindas
  INSERT INTO public.notificacoes (usuario_id, tipo, titulo, mensagem, link)
  VALUES (
    NEW.id,
    'info',
    'Bem-vindo ao Oficina em Ordem!',
    'Parabéns por se cadastrar! Configure sua oficina e cadastre seu primeiro cliente.',
    '/configuracoes'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- PASSO 6 — GARANTIR PERFIL PARA USUÁRIOS JÁ CADASTRADOS (correção retroativa)
-- ============================================================================

-- Cria perfil para quem não tem
INSERT INTO public.usuarios (id, email, nome_oficina)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nome_oficina', 'Minha Oficina')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios pu WHERE pu.id = au.id
);

-- Cria configurações padrão para quem não tem
INSERT INTO public.configuracoes (usuario_id, moeda, formato_data, notificacoes_email)
SELECT au.id, 'BRL', 'DD/MM/YYYY', true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.configuracoes pc WHERE pc.usuario_id = au.id
);


-- ============================================================================
-- PASSO 7 — CONCEDER PERMISSÕES PARA O ROLE AUTHENTICATED
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_set_usuario_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user   TO authenticated;


-- ============================================================================
-- PASSO 8 — PERMISSÕES MÍNIMAS PARA ANON (Segurança por RPC)
-- ============================================================================

GRANT USAGE  ON SCHEMA public TO anon;

-- Revoga acesso direto para evitar "pescagem" de dados
REVOKE SELECT ON public.ordens_servico FROM anon;
REVOKE SELECT ON public.clientes       FROM anon;
REVOKE SELECT ON public.veiculos       FROM anon;
REVOKE SELECT ON public.itens_os       FROM anon;
REVOKE SELECT ON public.usuarios       FROM anon;

-- Criação da função de entrega segura (Cofre Blindado)
CREATE OR REPLACE FUNCTION public.get_public_os_data(p_os_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'os', os.*,
    'cliente', (SELECT row_to_json(c) FROM (SELECT nome, telefone, email FROM public.clientes WHERE id = os.cliente_id) c),
    'veiculo', (SELECT row_to_json(v) FROM (SELECT modelo, placa, marca, ano, km_atual FROM public.veiculos WHERE id = os.veiculo_id) v),
    'oficina', (SELECT row_to_json(u) FROM (SELECT nome_oficina, telefone, email, cnpj, endereco, logotipo_url FROM public.usuarios WHERE id = os.usuario_id) u),
    'itens', (SELECT json_agg(i) FROM (SELECT * FROM public.itens_os WHERE ordem_servico_id = os.id) i)
  ) INTO v_result
  FROM public.ordens_servico os
  WHERE os.id = p_os_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_os_data(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_os_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assinar_os_cliente_publico(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.assinar_os_cliente_publico(UUID) TO authenticated;


-- ============================================================================
-- PASSO 9 — VERIFICAÇÃO FINAL
-- ============================================================================

-- 9.1 Tabelas com RLS ligado
SELECT
  relname       AS tabela,
  relrowsecurity AS rls_ativo
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- 9.2 Todas as políticas criadas
SELECT
  c.relname                          AS tabela,
  p.polname                          AS politica,
  p.polcmd                           AS operacao,
  pg_get_expr(p.polqual, c.oid)      AS condicao_using,
  pg_get_expr(p.polwithcheck, c.oid) AS condicao_with_check
FROM pg_class c
JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
ORDER BY c.relname, p.polname;

-- 9.3 Triggers ativos
SELECT
  t.tgname    AS trigger,
  c.relname   AS tabela,
  t.tgenabled AS ativo
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE NOT t.tgisinternal
  AND c.relnamespace = 'public'::regnamespace
ORDER BY c.relname, t.tgname;

-- 9.4 Usuários sem perfil (deve retornar 0 linhas)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.usuarios pu ON pu.id = au.id
WHERE pu.id IS NULL;


-- ============================================================================
-- ⚠  AÇÃO MANUAL NECESSÁRIA — DESABILITAR CONFIRMAÇÃO DE E-MAIL
-- ============================================================================
-- Não é possível fazer isso via SQL. Faça pelo Dashboard do Supabase:
--
--   1. Acesse: Authentication → Providers → Email
--   2. Desmarque: "Confirm email" (Confirmar e-mail)
--   3. Clique em "Save"
--
-- Isso permite que novos usuários façam login imediatamente após o cadastro,
-- sem precisar confirmar o e-mail. Recomendado para ambiente de desenvolvimento.
-- ============================================================================
