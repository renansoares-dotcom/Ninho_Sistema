"use client";

import MensagensCliente from "@/components/shared/MensagensCliente";
import { useProfile } from "@/components/shared/ProfileProvider";

export default function ClienteMensagensTab({ clienteId }: { clienteId: string }) {
  const profile = useProfile();
  return <MensagensCliente clienteId={clienteId} userId={profile.id} userNome={profile.nome} />;
}
