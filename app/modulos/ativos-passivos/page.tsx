import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function AtivosPassivosPage() {
  return (
    <>
      <ModuleHeader
        icon="🏗️"
        title="Ativos e Passivos"
        subtitle="Ativo Total, Crédito, Captações e Patrimônio Líquido"
      />
      <Client />
    </>
  );
}
