import Card from "./Card";

const perfis = [
  { nome: "Administrador", descricao: "Acesso total ao sistema, incluindo configurações e usuários" },
  { nome: "Diretor", descricao: "Dashboards executivos, financeiro e todos os projetos" },
  { nome: "Coordenador", descricao: "Gestão de uma carteira de consultores e clientes" },
  { nome: "Consultor", descricao: "Seus clientes, agenda, kanban e diagnósticos" },
  { nome: "Financeiro", descricao: "Contratos, parcelas e indicadores financeiros" },
  { nome: "Cliente (Portal)", descricao: "Acesso somente aos próprios dados, via portal dedicado" },
];

export default function ConfiguracoesPanel() {
  return (
    <div className="max-w-[1360px] mx-auto px-7 pb-16 pt-4 flex flex-col gap-4">
      <Card title="Dados da consultoria">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[12px] text-[#9aa0ac] mb-1">Nome</div>
            <div className="text-[13.5px] text-[#16181d] font-medium">Ninho Consultoria</div>
          </div>
          <div>
            <div className="text-[12px] text-[#9aa0ac] mb-1">Plano</div>
            <div className="text-[13.5px] text-[#16181d] font-medium">Multi-tenant · Hobby (dev)</div>
          </div>
        </div>
      </Card>

      <Card title="Perfis de acesso">
        <div className="flex flex-col divide-y divide-[#f2f3f5]">
          {perfis.map((p) => (
            <div key={p.nome} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-[13.5px] font-semibold text-[#16181d]">{p.nome}</div>
                <div className="text-[12.5px] text-[#767c88] mt-0.5">{p.descricao}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
