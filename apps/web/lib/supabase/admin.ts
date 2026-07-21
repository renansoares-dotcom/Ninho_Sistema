import { createClient } from "@supabase/supabase-js";

// Cliente com a service role key — ignora RLS completamente.
// USO RESTRITO: só em código de servidor (Route Handlers, Server Actions).
// NUNCA importar isso em um componente "use client" — a chave nunca pode
// chegar ao navegador.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente do servidor."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
