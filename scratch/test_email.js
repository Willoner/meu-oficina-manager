const SUPABASE_URL = "https://nvmzhjybjwprtupogumd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bXpoanliandwcnR1cG9ndW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjUzNjEsImV4cCI6MjA5MDY0MTM2MX0.7G68xu-731DQM8jVKKT_3qxktTLJP5RfdPstWUMsaEE";

async function testEmail() {
  const testEmailAddress = "test@example.com"; // Substitua pelo seu email se quiser testar a chegada na sua caixa de entrada
  console.log(`Testando envio de email (recuperação de senha) via Supabase Auth para: ${testEmailAddress}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: testEmailAddress })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERRO: O Supabase retornou um erro ao tentar enviar o email:");
      console.error(`Status ${response.status}:`, errorText);
    } else {
      console.log("SUCESSO: A requisição foi aceita pelo Supabase com status", response.status);
      console.log("Se o SMTP estiver configurado corretamente, o email deve chegar em instantes.");
      console.log("Dica: Verifique também no painel do Resend em 'Emails' se houve alguma falha real de envio ('Bounced' ou 'Dropped').");
    }
  } catch (err) {
    console.error("Erro na requisição:", err.message);
  }
}

testEmail();
