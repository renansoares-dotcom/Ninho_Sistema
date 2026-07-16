import React, { useState } from "react";
import {
  LayoutDashboard,
  Users2,
  KanbanSquare,
  Stethoscope,
  ChevronDown,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  FileCheck2,
  UserCheck,
  FolderKanban,
  ListChecks,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  Leaf,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

// ---------- Mock data ----------

const receitaMensal = [
  { mes: "Fev", valor: 182 },
  { mes: "Mar", valor: 196 },
  { mes: "Abr", valor: 208 },
  { mes: "Mai", valor: 221 },
  { mes: "Jun", valor: 214 },
  { mes: "Jul", valor: 247 },
];

const funilData = [
  { etapa: "Lead", qtd: 64 },
  { etapa: "Contato", qtd: 48 },
  { etapa: "Reunião", qtd: 33 },
  { etapa: "Diagnóstico", qtd: 21 },
  { etapa: "Proposta", qtd: 15 },
  { etapa: "Negociação", qtd: 9 },
  { etapa: "Contrato", qtd: 6 },
];

const kpis = [
  { label: "Clientes ativos", value: "86", delta: "+4,2%", up: true, icon: Building2 },
  { label: "Novos leads (mês)", value: "64", delta: "+12%", up: true, icon: Users2 },
  { label: "Contratos fechados", value: "6", delta: "-1", up: false, icon: FileCheck2 },
  { label: "Receita mensal", value: "R$ 247 mil", delta: "+8,9%", up: true, icon: Wallet },
  { label: "Consultores ativos", value: "14", delta: "0", up: true, icon: UserCheck },
  { label: "Projetos em andamento", value: "32", delta: "+3", up: true, icon: FolderKanban },
];

const atividadesRecentes = [
  { titulo: "Diagnóstico concluído — Grupo Alvorada", tempo: "há 24 min", tipo: "diagnostico" },
  { titulo: "Contrato assinado — Metalúrgica Ferro Sul", tempo: "há 1 h", tipo: "contrato" },
  { titulo: "Visita registrada — Padaria Trigo Dourado", tempo: "há 3 h", tipo: "visita" },
  { titulo: "Nova oportunidade — Studio Criativo Nix", tempo: "há 5 h", tipo: "lead" },
  { titulo: "Parcela vencida — Comércio Vale Verde", tempo: "ontem", tipo: "financeiro" },
];

const produtividade = [
  { nome: "Marina Costa", pct: 92 },
  { nome: "Rafael Souza", pct: 84 },
  { nome: "Juliana Prado", pct: 78 },
  { nome: "Bruno Alencar", pct: 65 },
];

const colunasCRM = [
  { id: "lead", nome: "Lead", cor: "#94a3b8" },
  { id: "contato", nome: "Contato", cor: "#60a5fa" },
  { id: "reuniao", nome: "Reunião", cor: "#818cf8" },
  { id: "diagnostico", nome: "Diagnóstico", cor: "#c084fc" },
  { id: "proposta", nome: "Proposta", cor: "#f0abfc" },
  { id: "negociacao", nome: "Negociação", cor: "#fbbf24" },
  { id: "contrato", nome: "Contrato", cor: "#34d399" },
  { id: "ativo", nome: "Cliente Ativo", cor: "#0e9f6e" },
];

const oportunidades = [
  { id: 1, empresa: "Studio Criativo Nix", etapa: "lead", valor: "R$ 18.000", prob: 20, dias: 2, resp: "MC" },
  { id: 2, empresa: "Vale Verde Comércio", etapa: "lead", valor: "R$ 9.500", prob: 15, dias: 6, resp: "RS" },
  { id: 3, empresa: "Trigo Dourado Padaria", etapa: "contato", valor: "R$ 12.000", prob: 30, dias: 3, resp: "JP" },
  { id: 4, empresa: "Ferro Sul Metalúrgica", etapa: "reuniao", valor: "R$ 64.000", prob: 45, dias: 5, resp: "MC" },
  { id: 5, empresa: "Grupo Alvorada", etapa: "diagnostico", valor: "R$ 38.000", prob: 55, dias: 8, resp: "BA" },
  { id: 6, empresa: "Nova Era Logística", etapa: "diagnostico", valor: "R$ 27.500", prob: 50, dias: 4, resp: "RS" },
  { id: 7, empresa: "Doce Sabor Alimentos", etapa: "proposta", valor: "R$ 21.000", prob: 65, dias: 6, resp: "JP" },
  { id: 8, empresa: "Construtora Horizonte", etapa: "negociacao", valor: "R$ 92.000", prob: 75, dias: 9, resp: "MC" },
  { id: 9, empresa: "TechFlow Sistemas", etapa: "contrato", valor: "R$ 45.000", prob: 90, dias: 2, resp: "BA" },
  { id: 10, empresa: "Metalúrgica Ferro Sul", etapa: "ativo", valor: "R$ 64.000", prob: 100, dias: 0, resp: "MC" },
];

// ---------- Shared bits ----------

function initialsColor(initials) {
  const palette = ["#0e9f6e", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4"];
  const idx = initials.charCodeAt(0) % palette.length;
  return palette[idx];
}

function Avatar({ initials, size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        background: initialsColor(initials),
        color: "white",
        fontSize: size * 0.38,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ---------- Top navigation ----------

function TopNav({ active, setActive }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "crm", label: "CRM", icon: Users2 },
    { key: "clientes", label: "Clientes", icon: Building2 },
    { key: "kanban", label: "Kanban", icon: KanbanSquare },
    { key: "diagnostico", label: "Diagnóstico", icon: Stethoscope },
  ];

  return (
    <div
      style={{
        borderBottom: "1px solid #eef0f2",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          padding: "0 28px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#0e9f6e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Leaf size={16} color="white" strokeWidth={2.4} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#16181d", letterSpacing: "-0.01em" }}>
              Ninho
            </span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {items.map((it) => {
              const Icon = it.icon;
              const isActive = active === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => setActive(it.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    background: isActive ? "#f0fbf6" : "transparent",
                    color: isActive ? "#0e9f6e" : "#5b6270",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <Icon size={15} strokeWidth={2} />
                  {it.label}
                </button>
              );
            })}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 10px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: "#5b6270",
              }}
            >
              Mais
              <ChevronDown size={14} />
            </button>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#f5f6f8",
              borderRadius: 8,
              padding: "6px 10px",
              width: 200,
            }}
          >
            <Search size={14} color="#9aa0ac" />
            <span style={{ fontSize: 12.5, color: "#9aa0ac" }}>Pesquisar...</span>
          </div>
          <div style={{ position: "relative" }}>
            <Bell size={17} color="#5b6270" strokeWidth={1.8} />
            <div
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 7,
                height: 7,
                borderRadius: "9999px",
                background: "#f04438",
                border: "1.5px solid white",
              }}
            />
          </div>
          <Avatar initials="VC" size={30} />
        </div>
      </div>
    </div>
  );
}

function PageHeader({ crumb, title, actionLabel, secondaryLabel }) {
  return (
    <div
      style={{
        maxWidth: 1360,
        margin: "0 auto",
        padding: "22px 28px 4px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 12.5, color: "#9aa0ac", marginBottom: 6 }}>{crumb}</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#16181d", letterSpacing: "-0.01em", margin: 0 }}>
          {title}
        </h1>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {secondaryLabel && (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 500,
              border: "1px solid #e4e6ea",
              background: "white",
              color: "#3f434d",
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={14} />
            {secondaryLabel}
          </button>
        )}
        {actionLabel && (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 15px",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              border: "none",
              background: "#0e9f6e",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(14,159,110,0.25)",
            }}
          >
            <Plus size={15} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Dashboard ----------

function KpiCard({ label, value, delta, up, icon: Icon }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f2",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: "#767c88", fontWeight: 500 }}>{label}</span>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#f5f6f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color="#5b6270" strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 650, color: "#16181d", letterSpacing: "-0.01em" }}>
          {value}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 12,
            fontWeight: 600,
            color: up ? "#0e9f6e" : "#f04438",
          }}
        >
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </span>
      </div>
    </div>
  );
}

function Card({ title, action, children, style }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f2",
        borderRadius: 14,
        padding: 22,
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#16181d" }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function DashboardView() {
  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "18px 28px 60px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card title="Evolução da receita" action={<ArrowUpRight size={15} color="#9aa0ac" />}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={receitaMensal} margin={{ left: -20, right: 4 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e9f6e" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0e9f6e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f0f1f3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9aa0ac" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9aa0ac" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v) => [`R$ ${v} mil`, "Receita"]}
                contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }}
              />
              <Area type="monotone" dataKey="valor" stroke="#0e9f6e" strokeWidth={2.4} fill="url(#receitaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Funil de conversão (mês)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funilData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="etapa"
                type="category"
                tick={{ fontSize: 12, fill: "#5b6270" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(v) => [`${v} oportunidades`, ""]}
                contentStyle={{ borderRadius: 10, border: "1px solid #eef0f2", fontSize: 12.5 }}
              />
              <Bar dataKey="qtd" fill="#0e9f6e" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card title="Atividades recentes">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {atividadesRecentes.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: i < atividadesRecentes.length - 1 ? "1px solid #f2f3f5" : "none",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "9999px",
                    background: "#0e9f6e",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13.5, color: "#3f434d", flex: 1 }}>{a.titulo}</span>
                <span style={{ fontSize: 12, color: "#9aa0ac", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} />
                  {a.tempo}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Produtividade dos consultores">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {produtividade.map((p) => (
              <div key={p.nome}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#3f434d", fontWeight: 500 }}>{p.nome}</span>
                  <span style={{ fontSize: 12.5, color: "#767c88" }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "#f0f1f3", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${p.pct}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "#0e9f6e",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- CRM ----------

function OportunidadeCard({ op }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f2",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#16181d", lineHeight: 1.3 }}>{op.empresa}</span>
        <MoreHorizontal size={15} color="#c2c6cd" />
      </div>
      <span style={{ fontSize: 14, fontWeight: 650, color: "#0e9f6e" }}>{op.valor}</span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Avatar initials={op.resp} size={22} />
          <span style={{ fontSize: 11.5, color: "#9aa0ac" }}>{op.dias}d na etapa</span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 7px",
            borderRadius: 999,
            background: "#f0fbf6",
            color: "#0e9f6e",
          }}
        >
          {op.prob}%
        </span>
      </div>
    </div>
  );
}

function CrmView() {
  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "18px 28px 60px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "#f5f6f8",
            borderRadius: 8,
            padding: "8px 12px",
            width: 260,
          }}
        >
          <Search size={14} color="#9aa0ac" />
          <span style={{ fontSize: 12.5, color: "#9aa0ac" }}>Buscar oportunidade ou empresa...</span>
        </div>
        {["Todos os responsáveis", "Origem", "Valor"].map((f) => (
          <button
            key={f}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 500,
              border: "1px solid #e4e6ea",
              background: "white",
              color: "#5b6270",
              cursor: "pointer",
            }}
          >
            {f}
            <ChevronDown size={13} />
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12 }}>
        {colunasCRM.map((col) => {
          const items = oportunidades.filter((o) => o.etapa === col.id);
          const total = items.reduce(
            (acc, o) => acc + Number(o.valor.replace(/[^\d]/g, "")),
            0
          );
          return (
            <div key={col.id} style={{ minWidth: 232, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 2px" }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: col.cor }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#3f434d" }}>{col.nome}</span>
                <span style={{ fontSize: 11.5, color: "#b0b4bb" }}>{items.length}</span>
                <span style={{ fontSize: 11, color: "#b0b4bb", marginLeft: "auto" }}>
                  R$ {(total / 1000).toFixed(0)}k
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((op) => (
                  <OportunidadeCard key={op.id} op={op} />
                ))}
                {items.length === 0 && (
                  <div
                    style={{
                      border: "1.5px dashed #e4e6ea",
                      borderRadius: 12,
                      padding: "18px 10px",
                      textAlign: "center",
                      fontSize: 12,
                      color: "#c2c6cd",
                    }}
                  >
                    Sem oportunidades
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- App ----------

export default function App() {
  const [active, setActive] = useState("dashboard");

  const headers = {
    dashboard: { crumb: "Início", title: "Dashboard Executivo", actionLabel: null, secondaryLabel: "Filtrar período" },
    crm: { crumb: "Comercial", title: "CRM — Funil de Vendas", actionLabel: "Nova oportunidade", secondaryLabel: "Filtros" },
    clientes: { crumb: "Início", title: "Clientes", actionLabel: "Novo cliente", secondaryLabel: null },
    kanban: { crumb: "Início", title: "Kanban", actionLabel: "Nova tarefa", secondaryLabel: null },
    diagnostico: { crumb: "Início", title: "Diagnóstico Empresarial", actionLabel: "Novo diagnóstico", secondaryLabel: null },
  };

  const h = headers[active];

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <TopNav active={active} setActive={setActive} />
      <PageHeader crumb={h.crumb} title={h.title} actionLabel={h.actionLabel} secondaryLabel={h.secondaryLabel} />
      {active === "dashboard" && <DashboardView />}
      {active === "crm" && <CrmView />}
      {!["dashboard", "crm"].includes(active) && (
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "60px 28px", textAlign: "center", color: "#9aa0ac", fontSize: 13.5 }}>
          Tela de "{h.title}" entra em uma próxima leva da Fase 2.
        </div>
      )}
    </div>
  );
}
