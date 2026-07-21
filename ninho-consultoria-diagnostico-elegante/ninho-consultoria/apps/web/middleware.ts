import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto:
     * - arquivos estáticos do Next (_next/static, _next/image)
     * - favicon, logo e outros assets públicos
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
