-- 1. Criar o bucket logos-oficina
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos-oficina', 'logos-oficina', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Permitir que qualquer usuário veja os logotipos (Público)
CREATE POLICY "Logotipos são públicos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'logos-oficina');

-- 3. Política: Usuários autenticados podem fazer upload apenas para sua própria pasta
CREATE POLICY "Usuários podem subir seus próprios logos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'logos-oficina' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Política: Usuários podem atualizar seus próprios logos
CREATE POLICY "Usuários podem atualizar seus próprios logos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'logos-oficina' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Política: Usuários podem deletar seus próprios logos
CREATE POLICY "Usuários podem deletar seus próprios logos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'logos-oficina' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
