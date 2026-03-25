import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function CreditoPFPage() {
  return (
    <>
      <ModuleHeader
        icon="👤"
        title="Crédito Pessoa Física"
        subtitle="Consignado, Veículos, Habitação e mais"
      />
      <Client />
    </>
  );
}
