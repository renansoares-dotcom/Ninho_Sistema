import { Suspense } from "react";
import FinanceiroPanel from "@/components/super-admin/FinanceiroPanel";

export default function FinanceiroPage() {
  return (
    <Suspense fallback={null}>
      <FinanceiroPanel />
    </Suspense>
  );
}
