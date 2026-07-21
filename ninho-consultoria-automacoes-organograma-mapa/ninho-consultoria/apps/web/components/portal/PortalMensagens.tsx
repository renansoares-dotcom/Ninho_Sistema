"use client";

import MensagensCliente from "@/components/shared/MensagensCliente";
import { usePortal } from "./PortalContext";

export default function PortalMensagens() {
  const { clienteId, userId, userNome } = usePortal();
  return (
    <div className="max-w-[1100px] mx-auto px-7 py-7 flex flex-col gap-4">
      <h1 className="text-[19px] font-semibold text-[#16181d]">Mensagens</h1>
      <MensagensCliente clienteId={clienteId} userId={userId} userNome={userNome} />
    </div>
  );
}
