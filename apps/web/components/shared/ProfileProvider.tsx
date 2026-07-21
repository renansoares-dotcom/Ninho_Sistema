"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/auth/permissions";

export type Profile = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  tenant_id: string;
  logoUrl: string | null;
};

const ProfileContext = createContext<Profile | null>(null);

export function ProfileProvider({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

// Hook de acesso ao usuário logado nos Client Components dentro da área (app).
// Lança erro se usado fora do provider — é sinal de bug de composição, não
// de "usuário deslogado" (isso já é tratado no layout do servidor).
export function useProfile(): Profile {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile() precisa ser usado dentro de <ProfileProvider>");
  }
  return ctx;
}
