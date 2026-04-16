-- =============================================================================
-- diagnostico_rls.sql
-- Execute cada bloco separadamente no SQL Editor do Supabase para diagnosticar
-- o isolamento de dados entre usuários.
-- =============================================================================


-- =============================================================================
-- BLOCO 1: Verificar se o trigger existe e está ativo
-- =============================================================================
SELECT
  t.tgname       AS trigger_name,
  t.tgenabled    AS enabled,   -- 'O' = always, 'D' = disabled
  c.relname      AS tabela,
  p.proname      AS funcao
FROM pg_trigger t
JOIN pg_class   c ON c.oid = t.tgrelid
JOIN pg_proc    p ON p.oid = t.tgfoid
WHERE t.tgname = 'on_auth_user_created';

-- Resultado esperado: 1 linha com enabled = 'O' (origin/always)
-- Se vier vazio → o trigger não existe! Execute o auth_security_setup.sql novamente.


-- =============================================================================
-- BLOCO 2: Verificar se os usuários de auth têm perfil em public.usuarios
-- =============================================================================
SELECT
  au.id                     AS auth_user_id,
  au.email                  AS email,
  au.created_at             AS criado_em,
  pu.id IS NOT NULL         AS tem_perfil_publico,
  pu.id                     AS perfil_id
FROM auth.users au
LEFT JOIN public.usuarios pu ON pu.id = au.id
ORDER BY au.created_at DESC;

-- Resultado esperado: coluna tem_perfil_publico = true para TODOS os usuários.
-- Se algum tiver false → o trigger falhou para esse usuário. Crie o perfil manualmente.


-- =============================================================================
-- BLOCO 3: Verificar RLS e políticas nas tabelas principais
-- =============================================================================
SELECT
  c.relname                          AS tabela,
  c.relrowsecurity                   AS rls_ativo,
  p.polname                          AS politica,
  p.polcmd                           AS operacao,
  pg_get_expr(p.polqual, c.oid)      AS condicao_using,
  pg_get_expr(p.polwithcheck, c.oid) AS condicao_with_check
FROM pg_class c
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
  AND c.relname IN ('clientes','veiculos','usuarios','itens_os','ordens_servico','pecas','configuracoes','notificacoes')
ORDER BY c.relname, p.polname;

-- Resultado esperado:
--   rls_ativo = true em TODAS as tabelas listadas
--   Cada tabela deve ter ao menos 1 política com auth.uid() na condição


-- =============================================================================
-- BLOCO 4: Verificar se existe alguma política "USING (true)" perigosa
-- (políticas abertas que deixam qualquer usuário ler qualquer dado)
-- =============================================================================
SELECT
  c.relname  AS tabela,
  p.polname  AS politica_perigosa,
  p.polcmd   AS operacao
FROM pg_class c
JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
  AND pg_get_expr(p.polqual, c.oid) = 'true'
ORDER BY c.relname;

-- Resultado esperado (tabelas protegidas): VAZIO para clientes, veiculos, pecas,
-- configuracoes, notificacoes.
-- ACEITÁVEL para ordens_servico (leitura pública por UUID — PublicOS.tsx).


-- =============================================================================
-- BLOCO 5: Forçar criação de perfil para usuários que não têm (se necessário)
-- Só execute se o BLOCO 2 mostrar algum tem_perfil_publico = false
-- =============================================================================
/*
INSERT INTO public.usuarios (id, email, nome_oficina)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nome_oficina', 'Minha Oficina')
FROM auth.users au
LEFT JOIN public.usuarios pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/


-- =============================================================================
-- BLOCO 6: Verificar se clientes estão com usuario_id correto
-- (Se algum registro tiver usuario_id de outro usuário, o dado veio de uma
-- época sem RLS ativo)
-- =============================================================================
SELECT
  c.id,
  c.nome,
  c.usuario_id,
  au.email AS email_do_dono
FROM public.clientes c
JOIN auth.users au ON au.id = c.usuario_id
ORDER BY c.created_at DESC
LIMIT 50;

-- Verifique se cada cliente pertence ao usuário correto.
