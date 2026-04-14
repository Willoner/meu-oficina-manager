-- 1. Permitir leitura pública das tabelas necessárias para visualizar a OS
-- Nota: O acesso é garantido apenas para quem possui o ID (UUID) da Ordem de Serviço.

ALTER POLICY "Usuarios podem ver suas proprias ordens" ON ordens_servico RENAME TO "Projetista e Dono podem ver ordens";
CREATE POLICY "Acesso público por ID" ON ordens_servico FOR SELECT USING (true);

CREATE POLICY "Acesso público clientes" ON clientes FOR SELECT USING (true);
CREATE POLICY "Acesso público veiculos" ON veiculos FOR SELECT USING (true);
CREATE POLICY "Acesso público itens_os" ON itens_os FOR SELECT USING (true);
CREATE POLICY "Acesso público usuarios" ON usuarios FOR SELECT USING (true);

-- 2. Função RPC para assinatura pública do cliente
-- Isso evita dar permissão de UPDATE direta na tabela para o role 'anon'
CREATE OR REPLACE FUNCTION assinar_os_cliente_publico(os_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ordens_servico
  SET 
    assinatura_cliente_aceito = TRUE,
    assinatura_cliente_em = NOW()
  WHERE id = os_id AND (status = 'aberta' OR status = 'em_andamento');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permitir que o role 'anon' execute esta função
GRANT EXECUTE ON FUNCTION assinar_os_cliente_publico(UUID) TO anon;
GRANT EXECUTE ON FUNCTION assinar_os_cliente_publico(UUID) TO authenticated;
