"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Check, Image as ImageIcon } from "lucide-react";
import Card from "./Card";
import { supabase } from "@/lib/supabase";
import { useProfile } from "./ProfileProvider";
import { ROLES_GESTAO } from "@/lib/auth/permissions";

const BUCKET = "logos";

export default function IdentidadeVisualPanel() {
  const profile = useProfile();
  const [logoUrl, setLogoUrl] = useState<string | null>(profile.logoUrl ?? null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!ROLES_GESTAO.includes(profile.role)) return null;

  async function selecionar(file: File) {
    if (!file.type.startsWith("image/")) {
      setErro("Envie um arquivo de imagem (PNG, JPG ou SVG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErro("A imagem precisa ter até 3MB.");
      return;
    }

    setErro(null);
    setEnviando(true);
    setSalvo(false);

    const extensao = file.name.split(".").pop();
    const caminho = `${profile.tenant_id}/logo.${extensao}`;

    const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(caminho, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (erroUpload) {
      setErro("Não foi possível enviar a imagem agora. Tente novamente.");
      setEnviando(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
    // Adiciona um parâmetro pra "furar" cache de navegador quando a logo é trocada
    const urlComVersao = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    await supabase
      .from("configuracoes_empresa")
      .update({ logo_url: urlComVersao })
      .eq("tenant_id", profile.tenant_id);

    setLogoUrl(urlComVersao);
    setEnviando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  return (
    <Card title="Identidade Visual">
      <p className="text-[12.5px] text-[#767c88] mb-4">
        Essa logo aparece no menu do sistema, no Portal do Cliente e no link público de Diagnóstico —
        é a primeira coisa que um potencial cliente vê.
      </p>

      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl border border-[#eef0f2] bg-[#f7f8fa] flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo atual" className="max-w-full max-h-full object-contain p-2" />
          ) : (
            <ImageIcon size={22} className="text-[#c2c6cd]" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold border border-[#e4e6ea] text-[#3f434d] hover:border-[#004AAD] hover:text-primary transition-colors disabled:opacity-60 w-fit"
          >
            {enviando ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {enviando ? "Enviando..." : logoUrl ? "Trocar logo" : "Enviar logo"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && selecionar(e.target.files[0])}
          />
          <span className="text-[11.5px] text-[#9aa0ac]">PNG ou SVG com fundo transparente funciona melhor. Até 3MB.</span>
          {salvo && (
            <span className="flex items-center gap-1.5 text-[12px] text-[#0e9f6e] font-medium">
              <Check size={13} /> Logo atualizada
            </span>
          )}
          {erro && <span className="text-[12px] text-[#f04438]">{erro}</span>}
        </div>
      </div>
    </Card>
  );
}
