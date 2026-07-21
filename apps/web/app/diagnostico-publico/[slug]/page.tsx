import DiagnosticoPublicoForm from "../DiagnosticoPublicoForm";

export default function DiagnosticoPublicoComSlugPage({ params }: { params: { slug: string } }) {
  return <DiagnosticoPublicoForm slug={params.slug} />;
}
