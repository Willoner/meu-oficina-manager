-- 1. Adicionar colunas de prazo na tabela ordens_servico
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS prazo DATE;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS notificacao_atraso_enviada BOOLEAN DEFAULT FALSE;

-- 2. Função para verificar atrasos e gerar notificações
CREATE OR REPLACE FUNCTION fn_verificar_atrasos_os()
RETURNS JSONB AS $$
DECLARE
  os_rec RECORD;
  count_notificacoes INTEGER := 0;
BEGIN
  -- Percorre OSs que:
  -- 1. Não estão concluídas nem canceladas
  -- 2. O prazo já passou (prazo < CURRENT_DATE)
  -- 3. Ainda não tiveram notificação de atraso enviada
  FOR os_rec IN 
    SELECT os.id, os.usuario_id, os.prazo 
    FROM ordens_servico os
    WHERE os.status NOT IN ('concluida', 'cancelada')
      AND os.prazo < CURRENT_DATE
      AND os.notificacao_atraso_enviada = FALSE
  LOOP
    -- Inserir notificação
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link)
    VALUES (
      os_rec.usuario_id,
      'os_atraso',
      'Ordem de Serviço em Atraso',
      'A OS #' || UPPER(LEFT(os_rec.id::text, 8)) || ' está atrasada. Prazo era: ' || TO_CHAR(os_rec.prazo, 'DD/MM/YYYY'),
      '/ordens-servico/' || os_rec.id || '/visualizar'
    );

    -- Marcar como enviada
    UPDATE ordens_servico SET notificacao_atraso_enviada = TRUE WHERE id = os_rec.id;
    
    count_notificacoes := count_notificacoes + 1;
  END LOOP;

  RETURN jsonb_build_object('notificacoes_enviadas', count_notificacoes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Agendamento via pg_cron (opcional - requer privilégio de superuser ou extensão ativa)
-- Se o pg_cron estiver disponível, execute manualmente no dashboard:
-- SELECT cron.schedule('verificar-atrasos-diario', '0 8 * * *', 'SELECT fn_verificar_atrasos_os()');
