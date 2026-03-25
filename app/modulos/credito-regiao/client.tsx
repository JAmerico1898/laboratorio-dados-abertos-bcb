"use client";

import TreemapModule from "@/components/shared/TreemapModule";
import { MODULO6_VARS, RELATORIO_CREDITO_GEO } from "@/lib/constants";

const variables = MODULO6_VARS.map((v) => ({
  key: v.key,
  label: v.label,
  icon: v.icon,
  description: v.description,
}));

export default function CreditoRegiaoClient() {
  return (
    <TreemapModule
      report={RELATORIO_CREDITO_GEO}
      variables={variables}
      defaultVariable="sudeste"
    />
  );
}
