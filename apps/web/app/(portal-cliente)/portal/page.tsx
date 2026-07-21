import { ClipboardList } from "lucide-react";

export default function PortalClientePage() {
  return (
    <div className="max-w-[1100px] mx-auto px-7 py-20 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#eaf1fb] flex items-center justify-center mb-5">
        <ClipboardList size={24} className="text-primary" />
      </div>
      <h1 className="text-[19px] font-semibold text-[#16181d]">Portal do Cliente</h1>
      <p className="text-[13.5px] text-[#767c88] mt-2 max-w-[420px]">
        Seu acesso já está funcionando. As telas do Portal — plano de trabalho, indicadores e arquivos
        — ainda estão em construção e chegam em breve.
      </p>
    </div>
  );
}
