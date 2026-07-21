import { Lightbulb } from "lucide-react";

type AreaNota = { area: string; nota: number };

const templates: Record<string, string> = {
  "Financeiro": "Estruturar fluxo de caixa semanal e revisar centro de custos para melhorar visibilidade financeira.",
  "RH": "Formalizar processo de avaliação de desempenho e plano de cargos e salários.",
  "Recursos Humanos": "Formalizar processo de avaliação de desempenho e plano de cargos e salários.",
  "Marketing": "Definir posicionamento de marca e implementar acompanhamento de indicadores de CAC e ROI.",
  "Comercial": "Estruturar funil de vendas com metas claras e adotar CRM para gestão de oportunidades.",
  "Produção": "Documentar processos produtivos e implementar controle de qualidade formalizado.",
  "Fiscal": "Revisar regime tributário atual e iniciar planejamento tributário ativo.",
  "Compras": "Implementar processo de cotação com múltiplos fornecedores e política de prazos definida.",
  "Estoque": "Implementar controle de estoque em tempo real com ponto de reposição por produto.",
  "Gestão": "Formalizar planejamento estratégico e instituir reuniões periódicas de indicadores.",
};

export default function DiagnosticoRecomendacoes({ areas }: { areas: AreaNota[] }) {
  const criticas = areas.filter((a) => a.nota < 6.5).sort((a, b) => a.nota - b.nota);

  if (criticas.length === 0) {
    return (
      <p className="text-[13px] text-[#3f434d]">
        Nenhuma área crítica identificada — foco em manter o nível de maturidade atual.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {criticas.map((a) => (
        <div key={a.area} className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#fff6e6] flex items-center justify-center shrink-0">
            <Lightbulb size={13} color="#b45309" />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold text-[#16181d]">{a.area}</div>
            <div className="text-[12.5px] text-[#767c88]">
              {templates[a.area] ?? "Priorizar ações de melhoria estrutural nesta área."}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
