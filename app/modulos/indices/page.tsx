import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function IndicesPage() {
  return (
    <>
      <ModuleHeader
        icon="📈"
        title="Índices Financeiros"
        subtitle="Barras horizontais comparando instituições por indicadores de Ativos, Capital e Resultado"
      />
      <Client />
    </>
  );
}
