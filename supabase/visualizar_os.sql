-- Adicionar colunas de endereço e logotipo na tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS logotipo_url TEXT;

-- Adicionar colunas de assinatura na tabela ordens_servico
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_cliente_aceito BOOLEAN DEFAULT FALSE;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_cliente_em TIMESTAMP WITH TIME ZONE;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_mecanico_aceito BOOLEAN DEFAULT FALSE;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_mecanico_em TIMESTAMP WITH TIME ZONE;
