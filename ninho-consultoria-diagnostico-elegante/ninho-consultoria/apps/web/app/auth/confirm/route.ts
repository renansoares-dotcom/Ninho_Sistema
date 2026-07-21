import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Rota chamada pelo link enviado por e-mail (recuperação de senha, convite,
// confirmação de cadastro). O Supabase Auth manda o usuário para cá com um
// `token_hash`; aqui trocamos esse token por uma sessão válida e então
// redirecionamos para o destino final (`next`, ex: /redefinir-senha).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
  }

  redirect("/login?erro=link_invalido");
}
