-- 1. Atualizar a tabela de usuários com campos do Stripe e Plano
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
-- Garante que o plano tenha valor padrão 'Gratuito' se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='plano') THEN
    ALTER TABLE usuarios ADD COLUMN plano TEXT DEFAULT 'Gratuito';
  END IF;
END $$;

-- 2. Criar a tabela de assinaturas para histórico e status detalhado
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT, -- active, past_due, canceled, etc
  plan_type TEXT DEFAULT 'Pro',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuarios podem ver suas proprias assinaturas"
ON assinaturas FOR SELECT
USING (auth.uid() = usuario_id);

-- 4. Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_assinaturas_updated_at
BEFORE UPDATE ON assinaturas
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
