-- ==========================================================
-- 1. FUNÇÃO E TRIGGER PARA NOVOS USUÁRIOS
-- ==========================================================

-- Função que cria o perfil automático na tabela public.usuarios e configuracoes padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.usuarios (id, email, nome_oficina)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'nome_oficina', 'Minha Oficina')
  );

  -- Criar configurações padrão
  INSERT INTO public.configuracoes (usuario_id, moeda, formato_data, notificacoes_email)
  VALUES (NEW.id, 'BRL', 'DD/MM/YYYY', true);

  -- Criar notificação de boas-vindas
  INSERT INTO public.notificacoes (usuario_id, tipo, titulo, mensagem, link)
  VALUES (
    NEW.id,
    'info',
    'Bem-vindo ao Oficina em Ordem!',
    'Parabéns por se cadastrar! Comece configurando sua oficina e cadastrando seu primeiro cliente.',
    '/configuracoes'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado após o INSERT no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- 2. HABILITAR RLS EM TODAS AS TABELAS
-- ==========================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 3. POLÍTICAS DE ACESSO (PERMISSÕES)
-- ==========================================================

-- Tabela: usuarios
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Tabela: clientes
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios clientes" ON public.clientes;
CREATE POLICY "Usuários podem gerenciar seus próprios clientes" ON public.clientes
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: veiculos
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios veículos" ON public.veiculos;
CREATE POLICY "Usuários podem gerenciar seus próprios veículos" ON public.veiculos
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: ordens_servico
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico;
CREATE POLICY "Usuários podem gerenciar suas próprias OS" ON public.ordens_servico
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: itens_os (Acesso via Ordens de Serviço)
DROP POLICY IF EXISTS "Usuários podem gerenciar itens das suas OS" ON public.itens_os;
CREATE POLICY "Usuários podem gerenciar itens das suas OS" ON public.itens_os
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = itens_os.ordem_servico_id
      AND ordens_servico.usuario_id = auth.uid()
    )
  );

-- Tabela: pagamentos
DROP POLICY IF EXISTS "Usuários podem gerenciar pagamentos das suas OS" ON public.pagamentos;
CREATE POLICY "Usuários podem gerenciar pagamentos das suas OS" ON public.pagamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ordens_servico
      WHERE ordens_servico.id = pagamentos.ordem_servico_id
      AND ordens_servico.usuario_id = auth.uid()
    )
  );

-- Tabela: pecas
DROP POLICY IF EXISTS "Usuários podem gerenciar seu estoque de peças" ON public.pecas;
CREATE POLICY "Usuários podem gerenciar seu estoque de peças" ON public.pecas
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: servicos
DROP POLICY IF EXISTS "Usuários podem gerenciar seu catálogo de serviços" ON public.servicos;
CREATE POLICY "Usuários podem gerenciar seu catálogo de serviços" ON public.servicos
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: configuracoes
DROP POLICY IF EXISTS "Usuários podem gerenciar suas configurações" ON public.configuracoes;
CREATE POLICY "Usuários podem gerenciar suas configurações" ON public.configuracoes
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: notificacoes
DROP POLICY IF EXISTS "Usuários podem gerenciar suas notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem gerenciar suas notificações" ON public.notificacoes
  FOR ALL USING (auth.uid() = usuario_id);

-- Tabela: assinaturas
DROP POLICY IF EXISTS "Usuários podem ver suas assinaturas" ON public.assinaturas;
CREATE POLICY "Usuários podem ver suas assinaturas" ON public.assinaturas
  FOR SELECT USING (auth.uid() = usuario_id);
