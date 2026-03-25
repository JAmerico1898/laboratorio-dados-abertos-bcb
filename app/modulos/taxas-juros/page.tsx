import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function TaxasJurosPage() {
  return (
    <>
      <ModuleHeader
        icon="💹"
        title="Taxas de Juros"
        subtitle="Rankings de taxas de juros por modalidade de crédito — Dados do BCB"
      />
      <Client />
    </>
  );
}
