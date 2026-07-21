// Envio de e-mail via Resend (https://resend.com) — API simples via fetch,
// sem precisar de SDK. Só funciona em código de servidor (Route Handlers),
// nunca em Client Components — a RESEND_API_KEY é secreta.
//
// Se RESEND_API_KEY não estiver configurada, a função não faz nada (falha
// silenciosa) — assim o resto do app continua funcionando normalmente
// mesmo antes desse passo de configuração ser feito.

export async function enviarEmail({
  para,
  assunto,
  html,
}: {
  para: string | string[];
  assunto: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE || "Ninho Consultoria <onboarding@resend.dev>";

  if (!apiKey) return { enviado: false, motivo: "RESEND_API_KEY não configurada" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: Array.isArray(para) ? para : [para],
        subject: assunto,
        html,
      }),
    });
    if (!res.ok) {
      const erro = await res.text().catch(() => "");
      return { enviado: false, motivo: erro };
    }
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}

// Template simples e consistente com a identidade visual (fundo claro,
// azul institucional). Reaproveitado por todos os disparos de e-mail.
export function emailBase({ titulo, corpo, cta }: { titulo: string; corpo: string; cta?: { texto: string; url: string } }) {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#fafafa; padding:32px 16px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border:1px solid #eef0f2; border-radius:16px; padding:32px;">
      <div style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#004AAD; font-weight:600; margin-bottom:12px;">
        Ninho Consultoria
      </div>
      <h1 style="font-size:19px; color:#16181d; margin:0 0 12px;">${titulo}</h1>
      <p style="font-size:14px; color:#5b6270; line-height:1.6; margin:0 0 20px;">${corpo}</p>
      ${
        cta
          ? `<a href="${cta.url}" style="display:inline-block; background:#004AAD; color:#ffffff; text-decoration:none; font-size:13.5px; font-weight:600; padding:11px 22px; border-radius:8px;">${cta.texto}</a>`
          : ""
      }
    </div>
  </div>`;
}
