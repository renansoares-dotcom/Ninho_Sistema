import TopNav from "@/components/shared/TopNav";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {children}
    </div>
  );
}
