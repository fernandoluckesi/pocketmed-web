import type { ReactNode } from "react";
import { FileCheck2, ScrollText } from "lucide-react";
import { MainLayout, type NavItem } from "./MainLayout";
import { backofficeLogout, getBackofficeUser } from "../services/backoffice";

/**
 * Back office menu. Reuses the exact platform shell (MainLayout) so the visual
 * language stays identical — only the navigation differs.
 */
const backofficeNavItems: NavItem[] = [
  {
    icon: FileCheck2,
    label: "Análise de Documentos",
    path: "/backoffice/doctor-verification",
  },
  { icon: ScrollText, label: "Auditoria", path: "/backoffice/audit" },
];

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  analyst: "Analista",
  auditor: "Auditor",
};

export function BackofficeLayout({ children }: { children: ReactNode }) {
  const staff = getBackofficeUser();

  return (
    <MainLayout
      variant="backoffice"
      items={backofficeNavItems}
      sectionLabel="Backoffice"
      roleLabel={
        staff?.role ? ROLE_LABELS[staff.role] || "Backoffice" : "Backoffice"
      }
      identity={{ name: staff?.name, email: staff?.email }}
      onLogout={backofficeLogout}
    >
      {children}
    </MainLayout>
  );
}
