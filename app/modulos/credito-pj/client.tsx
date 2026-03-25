"use client";

import TreemapModule from "@/components/shared/TreemapModule";
import { MODULO4_VARS, RELATORIO_CREDITO_PJ } from "@/lib/constants";

const variables = MODULO4_VARS.map((v) => ({
  key: v.key,
  label: v.label,
  icon: v.icon,
  description: v.description,
}));

export default function CreditoPJClient() {
  return (
    <TreemapModule
      report={RELATORIO_CREDITO_PJ}
      variables={variables}
      defaultVariable="total_pj"
    />
  );
}
