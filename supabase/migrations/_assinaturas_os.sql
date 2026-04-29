-- Adiciona suporte para assinaturas desenhadas (base64)
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_cliente_img TEXT;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS assinatura_mecanico_img TEXT;
