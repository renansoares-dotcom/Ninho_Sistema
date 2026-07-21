import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ninho Consultoria",
  description: "Plataforma de gestão completa para consultorias empresariais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
