// Regras de acesso por perfil (role).
//
// A tabela `profiles` no banco tem o enum user_role:
//   'admin' | 'diretor' | 'coordenador' | 'consultor' | 'financeiro' | 'cliente'
//
// 'cliente' nunca acessa a área interna (app) — é redirecionado para /portal.
// As diretrizes de design (docs/design) já previam isso: "menu superior
// contextual por perfil: Consultor não vê Financeiro".

export type UserRole = "admin" | "diretor" | "coordenador" | "consultor" | "financeiro" | "cliente";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  diretor: "Diretor",
  coordenador: "Coordenador",
  consultor: "Consultor",
  financeiro: "Financeiro",
  cliente: "Cliente",
};

// Perfis que enxergam a área interna (app). "cliente" fica de fora — vai pro Portal.
export const ROLES_INTERNOS: UserRole[] = ["admin", "diretor", "coordenador", "consultor", "financeiro"];

// Perfis com acesso a telas administrativas/financeiras sensíveis.
export const ROLES_GESTAO: UserRole[] = ["admin", "diretor"];
export const ROLES_FINANCEIRO: UserRole[] = ["admin", "diretor", "financeiro"];

// Mapa de visibilidade por rota (prefixo). Usado pelo TopNav para esconder
// itens de menu, e pelos layouts das páginas sensíveis para bloquear acesso
// direto por URL (defesa em profundidade — o RLS no banco é quem garante
// segurança de verdade, isso aqui é só UX).
export const ACESSO_POR_ROTA: { prefixo: string; roles: UserRole[] }[] = [
  { prefixo: "/financeiro", roles: ROLES_FINANCEIRO },
  { prefixo: "/faturamento", roles: ROLES_FINANCEIRO },
  { prefixo: "/automacoes", roles: ROLES_GESTAO },
  { prefixo: "/configuracoes", roles: ROLES_GESTAO },
];

export function podeAcessarRota(pathname: string, role: UserRole): boolean {
  if (role === "cliente") return false;
  const regra = ACESSO_POR_ROTA.find((r) => pathname.startsWith(r.prefixo));
  if (!regra) return true;
  return regra.roles.includes(role);
}

export function podeVerItemMenu(href: string, role: UserRole): boolean {
  const regra = ACESSO_POR_ROTA.find((r) => href.startsWith(r.prefixo));
  if (!regra) return true;
  return regra.roles.includes(role);
}
