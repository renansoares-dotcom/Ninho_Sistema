"use client";

import { createContext, useContext } from "react";

export type PortalContexto = {
  userId: string;
  userNome: string;
  clienteId: string;
  clienteNome: string;
  tenantId: string;
};

const Ctx = createContext<PortalContexto | null>(null);

export function PortalProvider({
  valor,
  children,
}: {
  valor: PortalContexto;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function usePortal(): PortalContexto {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortal() precisa ser usado dentro de <PortalProvider>");
  return ctx;
}
