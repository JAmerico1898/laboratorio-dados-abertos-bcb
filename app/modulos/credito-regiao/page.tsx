import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function CreditoRegiaoPage() {
  return (
    <>
      <ModuleHeader
        icon="🗺️"
        title="Crédito por Região"
        subtitle="Carteira de crédito por região geográfica"
      />
      <Client />
    </>
  );
}
