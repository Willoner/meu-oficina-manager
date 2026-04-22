-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE SET NULL,
  tipo_servico TEXT NOT NULL,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, cancelado, convertido
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver seus próprios agendamentos"
  ON public.agendamentos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir seus próprios agendamentos"
  ON public.agendamentos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos"
  ON public.agendamentos FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem excluir seus próprios agendamentos"
  ON public.agendamentos FOR DELETE
  USING (auth.uid() = usuario_id);

-- Trigger para updated_at
CREATE TRIGGER trigger_agendamentos_updated_at
    BEFORE UPDATE ON public.agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar Realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agendamentos;
  END IF;
END $$;

-- Permitir acesso para a role authenticated
GRANT ALL ON public.agendamentos TO authenticated;
