import ModuleHeader from "@/components/layout/ModuleHeader";
import Client from "./client";

export default function ResultadoPage() {
  return (
    <>
      <ModuleHeader
        icon="📊"
        title="Resultado"
        subtitle="Demonstração de Resultado — Anualizado (4 trimestres)"
      />
      <Client />
    </>
  );
}
