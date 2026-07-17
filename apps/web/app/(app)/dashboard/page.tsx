import {
  Building2,
  Users2,
  FileCheck2,
  Wallet,
  UserCheck,
  FolderKanban,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import KpiCard from "@/components/shared/KpiCard";
import Card from "@/components/shared/Card";
import { ReceitaChart, FunilChart } from "@/components/charts/DashboardCharts";
import { atividadesRecentes, produtividade } from "@/lib/mock-data";

const kpis = [
  { label: "Clientes ativos", value: "86", delta: "+4,2%", up: true, icon: Building2 },
  { label: "Novos leads (mês)", value: "64", delta: "+12%", up: true, icon: Users2 },
  { label: "Contratos fechados", value: "6", delta: "-1", up: false, icon: FileCheck2 },
  { label: "Receita mensal", value: "R$ 247 mil", delta: "+8,9%", up: true, icon: Wallet },
  { label: "Consultores ativos", value: "14", delta: "0", up: true, icon: UserCheck },
  { label: "Projetos em andamento", value: "32", delta: "+3", up: true, icon: FolderKanban },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader crumb="Início" title="Dashboard Executivo" secondaryLabel="Filtrar período" />

      <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-6 gap-3.5">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
          <Card title="Evolução da receita" action={<ArrowUpRight size={15} color="#9aa0ac" />}>
            <ReceitaChart />
          </Card>
          <Card title="Funil de conversão (mês)">
            <FunilChart />
          </Card>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
          <Card title="Atividades recentes">
            <div className="flex flex-col">
              {atividadesRecentes.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-[11px] ${
                    i < atividadesRecentes.length - 1 ? "border-b border-[#f2f3f5]" : ""
                  }`}
                >
                  <div className="w-[7px] h-[7px] rounded-full bg-primary shrink-0" />
                  <span className="text-[13.5px] text-[#3f434d] flex-1">{a.titulo}</span>
                  <span className="text-xs text-[#9aa0ac] flex items-center gap-1">
                    <Clock size={11} />
                    {a.tempo}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Produtividade dos consultores">
            <div className="flex flex-col gap-4">
              {produtividade.map((p) => (
                <div key={p.nome}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] text-[#3f434d] font-medium">{p.nome}</span>
                    <span className="text-[12.5px] text-[#767c88]">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f0f1f3] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
