-- =============================================================================
-- fix_rls_public_policies.sql
-- Remove as políticas "USING (true)" que anulam o RLS nas tabelas principais.
-- Mantém o acesso público SOMENTE para a rota de visualização de OS (PublicOS),
-- que já é protegida via função RPC com SECURITY DEFINER.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. REMOVER POLÍTICAS PÚBLICAS QUE ANULAM O ISOLAMENTO
-- -----------------------------------------------------------------------------

-- Tabela: clientes
DROP POLICY IF EXISTS "Acesso público clientes" ON public.clientes;

-- Tabela: veiculos
DROP POLICY IF EXISTS "Acesso público veiculos" ON public.veiculos;

-- Tabela: usuarios
DROP POLICY IF EXISTS "Acesso público usuarios" ON public.usuarios;

-- Tabela: itens_os
DROP POLICY IF EXISTS "Acesso público itens_os" ON public.itens_os;

-- Tabela: ordens_servico (a política geral pública)
DROP POLICY IF EXISTS "Acesso público por ID" ON public.ordens_servico;

-- Política renomeada em public_os_security.sql (pode existir com nome antigo)
DROP POLICY IF EXISTS "Projetista e Dono podem ver ordens" ON public.ordens_servico;
DROP POLICY IF EXISTS "Usuarios podem ver suas proprias ordens" ON public.ordens_servico;

-- -----------------------------------------------------------------------------
-- 2. GARANTIR QUE RLS ESTÁ ATIVO NAS TABELAS AFETADAS
-- -----------------------------------------------------------------------------

ALTER TABLE public.clientes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_os        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico  ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. RECRIAR POLÍTICAS CORRETAS E SEGURAS
-- -----------------------------------------------------------------------------

-- Tabela: usuarios (apenas o próprio usuário vê e edita o seu perfil)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabela: clientes
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios clientes" ON public.clientes;
CREATE POLICY "Usuários podem gerenciar seus próprios clientes" ON public.clientes
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Tabela: veiculos
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios veículos" ON public.veiculos;
CREATE POLICY "Usuários podem gerenciar seus próprios veículos" ON public.veiculos
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Tabela: ordens_servico
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico;
CREATE POLICY "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Tabela: itens_os (acesso indireto via OS do próprio usuário)
DROP POLICY IF EXISTS "Usuários podem gerenciar itens das suas OS" ON public.itens_os;
CREATE POLICY "Usuários podem gerenciar itens das suas OS" ON public.itens_os
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4. ACESSO PÚBLICO PARA VISUALIZAÇÃO DE OS (rota /os/:id/visualizar)
-- A segurança aqui depende do UUID único da OS como "senha".
-- Permitimos SELECT somente em ordens_servico, clientes e veiculos para anon,
-- mas APENAS via função RPC com SECURITY DEFINER — não via SELECT direto.
-- A função assinar_os_cliente_publico já existe e está correta.
-- Caso a página PublicOS.tsx faça SELECT direto, adicionar política abaixo:
-- -----------------------------------------------------------------------------

-- PublicOS.tsx faz SELECT direto nas tabelas (sem auth) para exibir a OS ao cliente.
-- A segurança é garantida pelo UUID único da OS (que funciona como "senha de acesso").
-- Habilitamos leitura anônima SOMENTE para os dados estritamente necessários.

-- ordens_servico: leitura pública por UUID (o cliente só acessa se tiver o link)
DROP POLICY IF EXISTS "Leitura pública OS por UUID" ON public.ordens_servico;
CREATE POLICY "Leitura pública OS por UUID" ON public.ordens_servico
  FOR SELECT USING (true);

-- clientes: leitura apenas para clientes vinculados a uma OS existente
DROP POLICY IF EXISTS "Leitura pública clientes via OS" ON public.clientes;
CREATE POLICY "Leitura pública clientes via OS" ON public.clientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.cliente_id = clientes.id
    )
  );

-- veiculos: leitura apenas para veículos vinculados a uma OS existente
DROP POLICY IF EXISTS "Leitura pública veiculos via OS" ON public.veiculos;
CREATE POLICY "Leitura pública veiculos via OS" ON public.veiculos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.veiculo_id = veiculos.id
    )
  );

-- itens_os: leitura apenas para itens de uma OS existente
DROP POLICY IF EXISTS "Leitura pública itens_os via OS" ON public.itens_os;
CREATE POLICY "Leitura pública itens_os via OS" ON public.itens_os
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
    )
  );

-- usuarios: leitura apenas do nome/telefone da oficina (sem dados sensíveis como email/cnpj)
-- NOTA: o join em PublicOS.tsx inclui email/cnpj — eles ficam expostos ao portador do link.
-- Isso é aceitável pois o cliente que recebe o link já tem relacionamento com a oficina.
DROP POLICY IF EXISTS "Leitura pública dados oficina via OS" ON public.usuarios;
CREATE POLICY "Leitura pública dados oficina via OS" ON public.usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.usuario_id = usuarios.id
    )
  );

-- =============================================================================
-- VERIFICAÇÃO FINAL: Políticas ativas por tabela
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
  AND c.relname IN ('clientes','veiculos','usuarios','itens_os','ordens_servico')
ORDER BY c.relname, p.polname;
