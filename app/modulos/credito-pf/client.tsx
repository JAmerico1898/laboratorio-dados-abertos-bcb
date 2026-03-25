"use client";

import TreemapModule from "@/components/shared/TreemapModule";
import { MODULO3_VARS, RELATORIO_CREDITO_PF } from "@/lib/constants";

const variables = MODULO3_VARS.map((v) => ({
  key: v.key,
  label: v.label,
  icon: v.icon,
  description: v.description,
}));

export default function CreditoPFClient() {
  return (
    <TreemapModule
      report={RELATORIO_CREDITO_PF}
      variables={variables}
      defaultVariable="total_pf"
    />
  );
}
