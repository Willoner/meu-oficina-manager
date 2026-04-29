-- Adiciona a classificação de OS (Preventiva ou Corretiva)
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS categoria_servico TEXT DEFAULT 'corretiva';
