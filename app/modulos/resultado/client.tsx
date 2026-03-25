"use client";

import TreemapModule from "@/components/shared/TreemapModule";
import { MODULO2_VARS, RELATORIO_RESULTADO } from "@/lib/constants";

const variables = MODULO2_VARS.map((v) => ({
  key: v.key,
  label: v.label,
  icon: v.icon,
  description: v.description,
}));

export default function ResultadoClient() {
  return (
    <TreemapModule
      report={RELATORIO_RESULTADO}
      variables={variables}
      defaultVariable="resultado_intermediacao"
      annualized
      useAbsValues
    />
  );
}
