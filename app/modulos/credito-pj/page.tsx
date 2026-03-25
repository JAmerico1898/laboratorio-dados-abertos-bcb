import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function CreditoPJPage() {
  return (
    <>
      <ModuleHeader
        icon="🏢"
        title="Crédito Pessoa Jurídica"
        subtitle="Capital de Giro, Investimento, Recebíveis e mais"
      />
      <Client />
    </>
  );
}
