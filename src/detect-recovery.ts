// Detecta e marca o estado de recuperação de senha ANTES de qualquer inicialização do Supabase ou limpeza de hash
if (typeof window !== "undefined") {
  const hash = window.location.hash || "";
  const search = window.location.search || "";
  if (
    hash.includes("recovery") || 
    hash.includes("access_token=") || 
    search.includes("recovery") ||
    hash.includes("type=recovery") ||
    search.includes("type=recovery")
  ) {
    console.log("[detect-recovery] Fluxo de recuperação detectado ativamente na URL!");
    localStorage.setItem("recovery_active", "true");
  }
}
