import { type NextRequest } from "next/server";
import { getDiagnosticoPublico, postDiagnosticoPublico } from "@/lib/diagnostico-publico-server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  return getDiagnosticoPublico(params.slug);
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const body = await request.json().catch(() => null);
  return postDiagnosticoPublico(body, params.slug);
}
