import Image from "next/image";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Image src="/logo.png" alt="Ninho Consultoria" width={150} height={60} className="h-11 w-auto" priority />
      </div>
      <div className="w-full max-w-[400px]">{children}</div>
      <p className="mt-8 text-[12.5px] text-[#9aa0ac]">
        © {new Date().getFullYear()} Ninho Consultoria — plataforma de gestão para consultorias
      </p>
    </div>
  );
}
