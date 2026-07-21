import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Cliente Supabase para uso em Server Components, Server Actions e Route
// Handlers. Lê/escreve a sessão nos cookies da requisição (via next/headers).
//
// Em Server Components "puros" (que só leem), a escrita de cookies falha
// silenciosamente (Next.js não permite `set-cookie` fora de Server Actions
// ou Route Handlers) — o try/catch abaixo cobre esse caso; o middleware
// (middleware.ts) é quem garante a renovação do cookie de sessão nesses casos.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Chamado de um Server Component sem permissão de escrita — ok,
            // o middleware cuida da renovação da sessão nesse caso.
          }
        },
      },
    }
  );
}
