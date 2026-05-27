import { FileText } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

export default function Reports() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios Financeiros</h1>
        <p className="text-sm text-slate-500 font-medium">Em breve</p>
        <p className="text-xs text-slate-400 max-w-md text-center">
          Esta seção está em desenvolvimento. Em breve você poderá gerar relatórios financeiros detalhados, exportar dados e visualizar análises avançadas.
        </p>
      </div>
    </MainLayout>
  );
}
