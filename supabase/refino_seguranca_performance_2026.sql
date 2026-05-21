-- ############################################################################
-- refino_seguranca_performance_2026.sql — Oficina em Ordem
--
-- Script Consolidado de Evolução de Banco de Dados.
-- Combina correções críticas de Segurança (RLS), Performance (Índices),
-- Integridade (CHECK Constraints) e Manutenibilidade (Deleção em Cascata).
--
-- EXECUÇÃO: Cole este conteúdo por inteiro no SQL Editor do Supabase e execute.
-- Todas as operações são seguras e idempotentes (re-executáveis).
-- ############################################################################


-- ============================================================================
-- PASSO 1 — GARANTIA E BLINDAGEM DE SEGURANÇA (RLS HERMÉTICO)
-- ============================================================================

-- 1.1 Garante que RLS está habilitado em TODAS as tabelas vitais
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

-- 1.2 Remove políticas RLS frouxas antigas que permitiam vazamento de dados via SELECT
DROP POLICY IF EXISTS "Leitura pública OS por UUID" ON public.ordens_servico;
DROP POLICY IF EXISTS "Leitura pública clientes via OS" ON public.clientes;
DROP POLICY IF EXISTS "Leitura pública veiculos via OS" ON public.veiculos;
DROP POLICY IF EXISTS "Leitura pública itens_os via OS" ON public.itens_os;
DROP POLICY IF EXISTS "Leitura pública dados oficina via OS" ON public.usuarios;

-- 1.3 Recria as políticas com isolamento de multitenancy absoluto por proprietário
-- ordens_servico
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico;
CREATE POLICY "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico
  FOR ALL TO authenticated 
  USING (auth.uid() = usuario_id) 
  WITH CHECK (auth.uid() = usuario_id);

-- clientes
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios clientes" ON public.clientes;
CREATE POLICY "Usuários podem gerenciar seus próprios clientes" ON public.clientes
  FOR ALL TO authenticated 
  USING (auth.uid() = usuario_id) 
  WITH CHECK (auth.uid() = usuario_id);

-- veiculos
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios veículos" ON public.veiculos;
CREATE POLICY "Usuários podem gerenciar seus próprios veículos" ON public.veiculos
  FOR ALL TO authenticated 
  USING (auth.uid() = usuario_id) 
  WITH CHECK (auth.uid() = usuario_id);

-- itens_os (acesso validado via propriedade da Ordem de Serviço pai)
DROP POLICY IF EXISTS "Usuários podem gerenciar itens das suas OS" ON public.itens_os;
CREATE POLICY "Usuários podem gerenciar itens das suas OS" ON public.itens_os
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
        AND ordens_servico.usuario_id = auth.uid()
    )
  );


-- ============================================================================
-- PASSO 2 — OTIMIZAÇÃO DE PERFORMANCE (ÍNDICES B-TREE)
-- ============================================================================
-- Evita Sequential Scans nas tabelas à medida que o volume cresce.
-- Acelera drasticamente a avaliação das regras RLS de tabelas filhas.

CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON public.clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_usuario_id ON public.veiculos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON public.veiculos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_usuario_id ON public.ordens_servico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_cliente_id ON public.ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_veiculo_id ON public.ordens_servico(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_itens_os_ordem_servico_id ON public.itens_os(ordem_servico_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_ordem_servico_id ON public.pagamentos(ordem_servico_id);
CREATE INDEX IF NOT EXISTS idx_pecas_usuario_id ON public.pecas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_servicos_usuario_id ON public.servicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id ON public.configuracoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);


-- ============================================================================
-- PASSO 3 — VALIDAÇÕES DE INTEGRIDADE (CHECK CONSTRAINTS REALISTAS)
-- ============================================================================
-- Protege contra bugs lógicos do frontend ou requisições mal-intencionadas diretas.
-- Impede valores negativos e previne overflows causados por erros de digitação.

-- 3.1 Itens da Ordem de Serviço
ALTER TABLE public.itens_os DROP CONSTRAINT IF EXISTS chk_quantidade_positiva;
ALTER TABLE public.itens_os ADD CONSTRAINT chk_quantidade_positiva 
  CHECK (quantidade > 0 AND quantidade <= 1000); -- Teto lógico realista de 1.000 p/ oficina

ALTER TABLE public.itens_os DROP CONSTRAINT IF EXISTS chk_valor_unitario_nao_negativo;
ALTER TABLE public.itens_os ADD CONSTRAINT chk_valor_unitario_nao_negativo 
  CHECK (valor_unitario >= 0 AND valor_unitario <= 9999999); -- Máximo de 9,9 milhões

ALTER TABLE public.itens_os DROP CONSTRAINT IF EXISTS chk_valor_total_nao_negativo;
ALTER TABLE public.itens_os ADD CONSTRAINT chk_valor_total_nao_negativo 
  CHECK (valor_total >= 0 AND valor_total <= 99999999); -- Máximo de 99 milhões

-- 3.2 Financeiro / Pagamentos
ALTER TABLE public.pagamentos DROP CONSTRAINT IF EXISTS chk_valor_pagamento_positivo;
ALTER TABLE public.pagamentos ADD CONSTRAINT chk_valor_pagamento_positivo 
  CHECK (valor > 0 AND valor <= 99999999); -- Máximo de 99 milhões

-- 3.3 Peças / Estoque
ALTER TABLE public.pecas DROP CONSTRAINT IF EXISTS chk_valor_venda_nao_negativo;
ALTER TABLE public.pecas ADD CONSTRAINT chk_valor_venda_nao_negativo 
  CHECK (valor_venda >= 0 AND valor_venda <= 9999999);

ALTER TABLE public.pecas DROP CONSTRAINT IF EXISTS chk_estoque_nao_negativo;
ALTER TABLE public.pecas ADD CONSTRAINT chk_estoque_nao_negativo 
  CHECK (estoque >= 0 AND estoque <= 100000); -- Teto físico de estoque de 100.000 unidades


-- ============================================================================
-- PASSO 4 — MANUTENIBILIDADE (DELEÇÃO EM CASCATA SEGURA)
-- ============================================================================
-- Ao deletar uma Ordem de Serviço, remove atomicamente itens e pagamentos agregados,
-- evitando registros órfãos ou erros de integridade referencial.

ALTER TABLE public.itens_os DROP CONSTRAINT IF EXISTS itens_os_ordem_servico_id_fkey;
ALTER TABLE public.itens_os ADD CONSTRAINT itens_os_ordem_servico_id_fkey 
  FOREIGN KEY (ordem_servico_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;

ALTER TABLE public.pagamentos DROP CONSTRAINT IF EXISTS pagamentos_ordem_servico_id_fkey;
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_ordem_servico_id_fkey 
  FOREIGN KEY (ordem_servico_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;

ALTER TABLE public.veiculos DROP CONSTRAINT IF EXISTS veiculos_cliente_id_fkey;
ALTER TABLE public.veiculos ADD CONSTRAINT veiculos_cliente_id_fkey 
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


-- ============================================================================
-- PASSO 5 — VERIFICAÇÃO PÓS-APLICAÇÃO (QUERY DE AUDITORIA)
-- ============================================================================
-- Execute a query abaixo para comprovar que todas as tabelas estão com RLS
-- ativadas com sucesso. Todas devem retornar "true" em "rls_ativo".

-- SELECT 
--   tablename AS tabela, 
--   rowsecurity AS rls_ativo 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('ordens_servico', 'clientes', 'veiculos', 'itens_os', 
--                     'pagamentos', 'pecas', 'servicos', 'configuracoes', 'notificacoes');
