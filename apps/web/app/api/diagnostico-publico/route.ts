import { type NextRequest } from "next/server";
import { getDiagnosticoPublico, postDiagnosticoPublico } from "@/lib/diagnostico-publico-server";

// Link "padrão" (sem slug) — resolve pro primeiro tenant cadastrado.
// Mantido por compatibilidade com o link já divulgado antes do multi-tenant
// existir. Escritórios novos usam /diagnostico-publico/[slug].
export async function GET() {
  return getDiagnosticoPublico();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return postDiagnosticoPublico(body);
}
