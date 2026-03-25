"use client";

import TreemapModule from "@/components/shared/TreemapModule";
import { MODULO1_VARS, RELATORIO_RESUMO } from "@/lib/constants";

const variables = MODULO1_VARS.map((v) => ({
  key: v.key,
  label: v.label,
  icon: v.icon,
  description: v.description,
}));

export default function AtivosPassivosClient() {
  return (
    <TreemapModule
      report={RELATORIO_RESUMO}
      variables={variables}
      defaultVariable="ativo_total"
    />
  );
}
