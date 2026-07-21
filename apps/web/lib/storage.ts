import { supabase } from "./supabase";

/**
 * Abre um arquivo do bucket privado gerando um link assinado (temporário,
 * expira em 60 segundos) na hora do clique — em vez de depender de uma URL
 * pública fixa, que não existe mais desde que o bucket "arquivos" passou a
 * ser privado (migration 030).
 */
export async function abrirArquivoPrivado(caminho: string | null, bucket = "arquivos") {
  if (!caminho) {
    alert("Esse arquivo não tem um caminho salvo — pode ser um envio antigo. Tente enviar de novo.");
    return;
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(caminho, 60);
  if (error || !data) {
    alert("Não foi possível abrir o arquivo agora. Tente novamente em instantes.");
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
