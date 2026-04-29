CREATE OR REPLACE FUNCTION public.assinar_os_cliente_publico_v2(p_os_id uuid, p_assinatura_img text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ordens_servico
  SET 
    assinatura_cliente_aceito = true,
    assinatura_cliente_em = now(),
    assinatura_cliente_img = p_assinatura_img
  WHERE id = p_os_id;
END;
$$;
