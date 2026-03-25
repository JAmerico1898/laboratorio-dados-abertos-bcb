import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function CartogramaPage() {
  return (
    <>
      <ModuleHeader
        icon="🇧🇷"
        title="Cartograma — Crédito por Região"
        subtitle="Mapa do Brasil com regiões proporcionais ao volume de crédito"
      />
      <Client />
    </>
  );
}
