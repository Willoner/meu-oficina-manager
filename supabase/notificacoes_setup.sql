-- 1. Criar a tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar o Realtime para esta tabela
-- Nota: Pode ser necessário no dashboard do Supabase em Database > Replication
-- mas este comando tenta adicionar se a publicação existir.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;
  END IF;
END $$;

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver suas proprias notificacoes"
ON notificacoes FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios podem atualizar suas proprias notificacoes"
ON notificacoes FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Sistema pode inserir notificacoes"
ON notificacoes FOR INSERT
WITH CHECK (true); -- Permitido via triggers

-- 4. Funções de Trigger para disparos automáticos

-- A) Notificação quando OS é concluída
CREATE OR REPLACE FUNCTION notify_os_concluida()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'concluida') THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link)
    VALUES (
      NEW.usuario_id, 
      'os_concluida', 
      'Ordem de Serviço Concluída', 
      'A OS #' || UPPER(LEFT(NEW.id::text, 8)) || ' foi marcada como concluída.',
      '/ordens-servico/' || NEW.id || '/visualizar'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_os_concluida
AFTER UPDATE ON ordens_servico
FOR EACH ROW EXECUTE FUNCTION notify_os_concluida();

-- B) Notificação quando Cliente Assina
CREATE OR REPLACE FUNCTION notify_cliente_assinou()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.assinatura_cliente_aceito IS DISTINCT FROM NEW.assinatura_cliente_aceito AND NEW.assinatura_cliente_aceito = TRUE) THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link)
    VALUES (
      NEW.usuario_id, 
      'cliente_assinou', 
      'O Cliente Assinou!', 
      'O cliente deu o aceite digital na OS #' || UPPER(LEFT(NEW.id::text, 8)) || '.',
      '/ordens-servico/' || NEW.id || '/visualizar'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_cliente_assinou
AFTER UPDATE ON ordens_servico
FOR EACH ROW EXECUTE FUNCTION notify_cliente_assinou();

-- C) Notificação quando Mecânico Assina (Confirmação)
CREATE OR REPLACE FUNCTION notify_mecanico_assinou()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.assinatura_mecanico_aceito IS DISTINCT FROM NEW.assinatura_mecanico_aceito AND NEW.assinatura_mecanico_aceito = TRUE) THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link)
    VALUES (
      NEW.usuario_id, 
      'mecanico_assinou', 
      'Você assinou a OS', 
      'Sua assinatura na OS #' || UPPER(LEFT(NEW.id::text, 8)) || ' foi registrada.',
      '/ordens-servico/' || NEW.id || '/visualizar'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_mecanico_assinou
AFTER UPDATE ON ordens_servico
FOR EACH ROW EXECUTE FUNCTION notify_mecanico_assinou();
