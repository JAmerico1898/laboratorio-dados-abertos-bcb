import type {
  ModuleDef,
  VarDef,
  CreditVarDef,
  RegionVarDef,
  IndexDef,
  ModalityDef,
  Segment,
} from "./types";

// ─────────────────────────────────────────────
// APP INFO
// ─────────────────────────────────────────────
export const APP_TITLE = "Laboratório de Dados Públicos";
export const APP_SUBTITLE =
  "Explore e visualize dados do Portal de Dados Abertos do Banco Central do Brasil. Consulte informações sobre ativos, crédito, taxas de juros e indicadores financeiros das instituições reguladas.";
export const APP_ICON = "🏦";

// ─────────────────────────────────────────────
// MODULES (for Hub)
// ─────────────────────────────────────────────
export const MODULES: ModuleDef[] = [
  {
    slug: "ativos-passivos",
    title: "Ativos e Passivos",
    icon: "🏗️",
    description: "Treemap de Ativo Total, Crédito, Captações e PL",
    vizType: "treemap",
  },
  {
    slug: "resultado",
    title: "Resultado",
    icon: "📊",
    description: "Treemap de Intermediação, Serviços, Despesas e Lucro",
    vizType: "treemap",
  },
  {
    slug: "credito-pf",
    title: "Crédito Pessoa Física",
    icon: "👤",
    description: "Treemap de Consignado, Veículos, Habitação e mais",
    vizType: "treemap",
  },
  {
    slug: "credito-pj",
    title: "Crédito Pessoa Jurídica",
    icon: "🏢",
    description: "Treemap de Capital de Giro, Investimento, Recebíveis",
    vizType: "treemap",
  },
  {
    slug: "taxas-juros",
    title: "Taxas de Juros",
    icon: "💹",
    description: "Rankings de taxas de operações de crédito",
    vizType: "custom",
  },
  {
    slug: "indices",
    title: "Índices Financeiros",
    icon: "📈",
    description: "Barras horizontais: Basileia, ROI, Eficiência e mais",
    vizType: "barras",
  },
  {
    slug: "credito-regiao",
    title: "Crédito por Região",
    icon: "🗺️",
    description: "Treemap de carteira de crédito por região geográfica",
    vizType: "treemap",
  },
  {
    slug: "cartograma",
    title: "Crédito Total por Região",
    icon: "🇧🇷",
    description: "Cartograma do Brasil com o total de crédito por região",
    vizType: "cartograma",
  },
];

// ─────────────────────────────────────────────
// SEGMENTATION
// ─────────────────────────────────────────────
export const TCB_OVERRIDE = new Set(["N1", "N2", "N4"]);
export const VALID_SR = new Set(["S1", "S2", "S3", "S4"]);
export const ALL_SEGMENTS: Segment[] = ["N1", "N2", "N4", "S1", "S2", "S3", "S4"];
export const DEFAULT_SEGMENTS: Segment[] = ["S1", "S2"];

export const SEGMENT_LABELS: Record<Segment, string> = {
  N1: "Conglomerado Prudencial Tipo 1",
  N2: "Conglomerado Prudencial Tipo 2",
  N4: "Instituição Individual Tipo 4",
  S1: "Segmento S1",
  S2: "Segmento S2",
  S3: "Segmento S3",
  S4: "Segmento S4",
};

export const SEGMENT_COLORS: Record<Segment, string> = {
  N1: "#e11d48",
  N2: "#f97316",
  N4: "#38bdf8",
  S1: "#0891b2",
  S2: "#059669",
  S3: "#d97706",
  S4: "#7c3aed",
};

// ─────────────────────────────────────────────
// MATERIALITY THRESHOLDS
// ─────────────────────────────────────────────
export const MIN_ATIVO_TOTAL = 100_000_000; // R$ 100 milhões (raw value)
export const MIN_PL = 20_000_000; // R$ 20 milhões (raw value)

// ─────────────────────────────────────────────
// BANK SHORT NAMES
// ─────────────────────────────────────────────
export const BANK_SHORT_NAMES: Record<string, string> = {
  "BCO DO BRASIL S.A.": "BB",
  "BCO BRADESCO S.A.": "Bradesco",
  "ITAÚ UNIBANCO S.A.": "Itaú",
  "CAIXA ECONOMICA FEDERAL": "Caixa",
  "BCO SANTANDER (BRASIL) S.A.": "Santander",
  "BCO BTG PACTUAL S.A.": "BTG Pactual",
  "BCO SAFRA S.A.": "Safra",
  "BCO VOTORANTIM S.A.": "Votorantim",
  "NU PAGAMENTOS S.A. - IP": "Nubank",
  "BCO CITIBANK S.A.": "Citi",
  "BCO J.P. MORGAN S.A.": "JP Morgan",
  "BANCO INTER S.A.": "Inter",
  "BCO ABC BRASIL S.A.": "ABC Brasil",
  "BCO DAYCOVAL S.A.": "Daycoval",
  "BCO BMG S.A.": "BMG",
  "BCO PAN S.A.": "PAN",
  "BCO ORIGINAL S.A.": "Original",
  "BCO C6 S.A.": "C6 Bank",
  "BCO BNP PARIBAS BRASIL S.A.": "BNP Paribas",
  "BCO COOPERATIVO DO BRASIL S.A. - BANCOOB": "Bancoob",
  "BCO COOPERATIVO SICREDI S.A.": "Sicredi",
  BNDES: "BNDES",
  "BCO DO NORDESTE DO BRASIL S.A.": "BNB",
  "BCO DA AMAZONIA S.A.": "BASA",
  "ITAÚ UNIBANCO BM S.A.": "Itaú",
  "CAIXA ECONOMICA FEDERAL (CEF)": "Caixa",
  "BCO CREDIT SUISSE (BRL) S.A.": "Credit Suisse",
  "BCO MODAL S.A.": "Modal",
  "XP INVESTIMENTOS CCTVM S.A.": "XP",
  "BCO MERCANTIL DO BRASIL S.A.": "Mercantil",
};

export function getShortName(fullName: string): string {
  if (fullName in BANK_SHORT_NAMES) {
    return BANK_SHORT_NAMES[fullName];
  }
  const name = fullName.replace("BCO ", "").replace("S.A.", "").trim();
  return name.length > 20 ? name.slice(0, 20) : name;
}

// ─────────────────────────────────────────────
// IF.DATA REPORT NUMBERS
// ─────────────────────────────────────────────
export const RELATORIO_RESUMO = 1;
export const RELATORIO_ATIVO = 2;
export const RELATORIO_PASSIVO = 3;
export const RELATORIO_RESULTADO = 4;
export const RELATORIO_CREDITO_GEO = 9;
export const RELATORIO_CREDITO_PF = 11;
export const RELATORIO_CREDITO_PJ = 13;

export const TIPO_INSTITUICAO_TODAS = [1, 2, 3];
export const TIPO_INST_CREDITO = 2;

// ─────────────────────────────────────────────
// MODULE 1: ATIVOS E PASSIVOS
// ─────────────────────────────────────────────
export const MODULO1_VARS: VarDef[] = [
  {
    key: "ativo_total",
    nomeColuna: "Ativo Total",
    label: "Ativo Total",
    icon: "🏦",
    description: "Total de ativos das instituições",
    relatorio: RELATORIO_RESUMO,
  },
  {
    key: "carteira_credito",
    nomeColuna: "Carteira de Crédito",
    label: "Operações de Crédito",
    icon: "💳",
    description: "Carteira de crédito total",
    relatorio: RELATORIO_RESUMO,
  },
  {
    key: "captacoes",
    nomeColuna: "Captações",
    label: "Captações",
    icon: "💰",
    description: "Total de captações (depósitos e funding)",
    relatorio: RELATORIO_RESUMO,
  },
  {
    key: "patrimonio_liquido",
    nomeColuna: "Patrimônio Líquido",
    label: "Patrimônio Líquido",
    icon: "🛡️",
    description: "Capital próprio das instituições",
    relatorio: RELATORIO_RESUMO,
  },
];

// ─────────────────────────────────────────────
// MODULE 2: RESULTADO (DRE — Annualized)
// ─────────────────────────────────────────────
export const MODULO2_VARS: VarDef[] = [
  {
    key: "resultado_intermediacao",
    nomeColuna: "Resultado de Intermediação Financeira \n(c) = (a) + (b)",
    label: "Resultado de Intermediação Financeira",
    icon: "🔄",
    description: "Receitas menos despesas de intermediação",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "despesas_captacao",
    nomeColuna: "Despesas de Captação \n(b1)",
    label: "Despesas de Captação",
    icon: "💸",
    description: "Custo de captação de recursos",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "rendas_tarifas",
    nomeColuna: "Rendas de Tarifas Bancárias \n(d2)",
    label: "Tarifas Bancárias",
    icon: "🏷️",
    description: "Rendas de tarifas bancárias",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "rendas_servicos",
    nomeColuna: "Rendas de Prestação de Serviços \n(d1)",
    label: "Rendas de Serviços",
    icon: "🎯",
    description: "Rendas de prestação de serviços",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "despesas_pessoal",
    nomeColuna: "Despesas de Pessoal \n(d3)",
    label: "Despesas de Pessoal",
    icon: "👥",
    description: "Despesas com funcionários",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "despesas_admin",
    nomeColuna: "Despesas Administrativas \n(d4)",
    label: "Despesas Administrativas",
    icon: "🏛️",
    description: "Despesas administrativas gerais",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
  {
    key: "lucro_liquido",
    nomeColuna: "Lucro Líquido \n(j) = (g) + (h) + (i)",
    label: "Lucro Líquido",
    icon: "✨",
    description: "Resultado líquido do período",
    relatorio: RELATORIO_RESULTADO,
    isDre: true,
  },
];

// ─────────────────────────────────────────────
// MODULE 3: CRÉDITO PF (Relatório 11)
// ─────────────────────────────────────────────
export const MODULO3_VARS: CreditVarDef[] = [
  {
    key: "total_pf",
    grupo: "Total da Carteira de Pessoa Física",
    label: "Total Pessoa Física",
    icon: "👥",
    description: "Carteira total de crédito PF",
  },
  {
    key: "consignado",
    grupo: "Empréstimo com Consignação em Folha",
    label: "Consignado",
    icon: "📋",
    description: "Crédito consignado em folha",
  },
  {
    key: "pessoal",
    grupo: "Empréstimo sem Consignação em Folha",
    label: "Empréstimo Pessoal",
    icon: "💵",
    description: "Crédito pessoal sem consignação",
  },
  {
    key: "habitacao",
    grupo: "Habitação",
    label: "Habitação",
    icon: "🏠",
    description: "Crédito imobiliário",
  },
  {
    key: "veiculos",
    grupo: "Veículos",
    label: "Veículos",
    icon: "🚗",
    description: "Financiamento de veículos",
  },
  {
    key: "cartao",
    grupo: "Cartão de Crédito",
    label: "Cartão de Crédito",
    icon: "💳",
    description: "Saldo de cartão de crédito",
  },
  {
    key: "rural_pf",
    grupo: "Rural e Agroindustrial",
    label: "Rural e Agroindustrial",
    icon: "🌾",
    description: "Crédito rural PF",
  },
  {
    key: "outros_pf",
    grupo: "Outros Créditos",
    label: "Outros Créditos",
    icon: "📦",
    description: "Outras modalidades de crédito PF",
  },
];

// ─────────────────────────────────────────────
// MODULE 4: CRÉDITO PJ (Relatório 13)
// ─────────────────────────────────────────────
export const MODULO4_VARS: CreditVarDef[] = [
  {
    key: "total_pj",
    grupo: "Total da Carteira de Pessoa Jurídica",
    label: "Total Pessoa Jurídica",
    icon: "🏢",
    description: "Carteira total de crédito PJ",
  },
  {
    key: "capital_giro",
    grupo: "Capital de Giro",
    label: "Capital de Giro",
    icon: "🔄",
    description: "Crédito para capital de giro",
  },
  {
    key: "investimento",
    grupo: "Investimento",
    label: "Investimento",
    icon: "📈",
    description: "Financiamento de investimento",
  },
  {
    key: "recebiveis",
    grupo: "Operações com Recebíveis",
    label: "Operações com Recebíveis",
    icon: "📄",
    description: "Antecipação de recebíveis",
  },
  {
    key: "conta_garantida",
    grupo: "Cheque Especial e Conta Garantida",
    label: "Conta Garantida",
    icon: "📝",
    description: "Cheque especial e conta garantida",
  },
  {
    key: "habitacional_pj",
    grupo: "Habitacional",
    label: "Habitacional",
    icon: "🏗️",
    description: "Crédito habitacional PJ",
  },
  {
    key: "infraestrutura",
    grupo: "Financiamento de Infraestrutura/Desenvolvimento/Projeto e Outros Créditos",
    label: "Infraestrutura / Projeto",
    icon: "🏭",
    description: "Infra, desenvolvimento e outros",
  },
  {
    key: "comex",
    grupo: "Comércio Exterior",
    label: "Comércio Exterior",
    icon: "🌎",
    description: "Financiamento de comércio exterior",
  },
  {
    key: "rural_pj",
    grupo: "Rural e Agroindustrial",
    label: "Rural e Agroindustrial",
    icon: "🌾",
    description: "Crédito rural PJ",
  },
  {
    key: "outros_pj",
    grupo: "Outros Créditos",
    label: "Outros Créditos",
    icon: "📦",
    description: "Outras modalidades de crédito PJ",
  },
];

// ─────────────────────────────────────────────
// MODULE 6: CRÉDITO POR REGIÃO (Relatório 9)
// ─────────────────────────────────────────────
export const MODULO6_VARS: RegionVarDef[] = [
  {
    key: "sudeste",
    nomeColuna: "Sudeste",
    label: "Sudeste",
    icon: "🏙️",
    description: "Carteira de crédito na região Sudeste",
  },
  {
    key: "centro_oeste",
    nomeColuna: "Centro-oeste",
    label: "Centro-Oeste",
    icon: "🌾",
    description: "Carteira de crédito na região Centro-Oeste",
  },
  {
    key: "nordeste",
    nomeColuna: "Nordeste",
    label: "Nordeste",
    icon: "☀️",
    description: "Carteira de crédito na região Nordeste",
  },
  {
    key: "norte",
    nomeColuna: "Norte",
    label: "Norte",
    icon: "🌿",
    description: "Carteira de crédito na região Norte",
  },
  {
    key: "sul",
    nomeColuna: "Sul",
    label: "Sul",
    icon: "❄️",
    description: "Carteira de crédito na região Sul",
  },
];

// ─────────────────────────────────────────────
// MODULE 7: ÍNDICES FINANCEIROS
// ─────────────────────────────────────────────
export const INDICES: IndexDef[] = [
  {
    key: "credito_pct_ativos",
    label: "Crédito (% do Ativo)",
    category: "ativos",
    unit: "pct",
    description: "Carteira de Crédito / Ativo Total",
    higherIsBetter: true,
  },
  {
    key: "provisoes_pct_carteira",
    label: "Provisões (% da Carteira)",
    category: "ativos",
    unit: "pct",
    description: "Provisões / Operações de Crédito",
    higherIsBetter: false,
  },
  {
    key: "basileia",
    label: "Índice de Basileia",
    category: "capital",
    unit: "pct",
    description: "Índice de Basileia (direto do Relatório 1)",
    higherIsBetter: true,
  },
  {
    key: "alavancagem",
    label: "Alavancagem (PL/AT)",
    category: "capital",
    unit: "pct",
    description: "Patrimônio Líquido / Ativo Total",
    higherIsBetter: true,
  },
  {
    key: "pl_ajustado",
    label: "PL Ajustado",
    category: "capital",
    unit: "currency",
    description: "Patrimônio Líquido Ajustado",
    higherIsBetter: true,
  },
  {
    key: "resultado_intermediacao_pct",
    label: "Resultado Intermediação (%)",
    category: "resultado",
    unit: "pct",
    description: "Resultado de Intermediação / Carteira de Crédito",
    higherIsBetter: true,
  },
  {
    key: "despesa_captacao_pct",
    label: "Despesa de Captação (%)",
    category: "resultado",
    unit: "pct",
    description: "Despesas de Captação / Captações",
    higherIsBetter: false,
  },
  {
    key: "roa",
    label: "ROA",
    category: "resultado",
    unit: "pct",
    description: "Lucro Líquido (anualizado) / Ativo Total",
    higherIsBetter: true,
  },
  {
    key: "eficiencia",
    label: "Índice de Eficiência",
    category: "resultado",
    unit: "pct",
    description:
      "(Despesas Pessoal + Despesas Admin) / (Resultado Intermediação + Serviços + Tarifas)",
    higherIsBetter: false,
  },
];

// ─────────────────────────────────────────────
// MODULE 5: TAXAS DE JUROS — Modalities
// ─────────────────────────────────────────────
export const MODALITIES: ModalityDef[] = [
  { slug: "financiamento_imobiliario_com_taxas_reguladas_-_pre-fixado", name: "Financiamento Imobiliário Pré-fixado", type: "monthly", excludeFromRanking: true },
  { slug: "financiamento_imobiliario_com_taxas_de_mercado_-_pre-fixado", name: "Financiamento Imobiliário Mercado Pré-fixado", type: "monthly", excludeFromRanking: true },
  { slug: "credito_pessoal_consignado_publico", name: "Consignado Público", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_consignado_inss", name: "Consignado INSS", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_consignado_privado", name: "Consignado Privado", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_nao_consignado", name: "Crédito Pessoal Não-Consignado", type: "daily", excludeFromRanking: false },
  { slug: "aquisicao_de_veiculos", name: "Aquisição de Veículos", type: "daily", excludeFromRanking: false },
  { slug: "cheque_especial", name: "Cheque Especial", type: "daily", excludeFromRanking: false },
  { slug: "cartao_de_credito_rotativo", name: "Cartão de Crédito Rotativo", type: "daily", excludeFromRanking: true },
  { slug: "cartao_de_credito_parcelado", name: "Cartão de Crédito Parcelado", type: "daily", excludeFromRanking: true },
  { slug: "capital_de_giro_com_prazo_de_ate_365_dias", name: "Capital de Giro até 365 dias", type: "daily", excludeFromRanking: false },
  { slug: "capital_de_giro_com_prazo_superior_a_365_dias", name: "Capital de Giro acima de 365 dias", type: "daily", excludeFromRanking: false },
  { slug: "conta_garantida", name: "Conta Garantida", type: "daily", excludeFromRanking: true },
  { slug: "desconto_de_duplicatas", name: "Desconto de Duplicatas", type: "daily", excludeFromRanking: true },
];

// ─────────────────────────────────────────────
// MODULE 8: CARTOGRAMA — Region Centroids
// ─────────────────────────────────────────────
export const REGION_CENTROIDS: Record<string, { x: number; y: number; color: string }> = {
  Norte: { x: 220, y: 130, color: "#fb7185" },
  Nordeste: { x: 430, y: 200, color: "#fbbf24" },
  "Centro-Oeste": { x: 280, y: 310, color: "#a78bfa" },
  Sudeste: { x: 400, y: 380, color: "#22d3ee" },
  Sul: { x: 320, y: 480, color: "#34d399" },
};

export const CARTOGRAM_MIN_RADIUS = 30;
export const CARTOGRAM_MAX_RADIUS = 110;

// ─────────────────────────────────────────────
// Variable key lookup (key → nomeColuna)
// Used by API routes to avoid encoding issues
// ─────────────────────────────────────────────
export const VAR_KEY_MAP: Record<string, string> = {};

// Populate from all module variable definitions
for (const v of MODULO1_VARS) {
  VAR_KEY_MAP[v.key] = v.nomeColuna;
}
for (const v of MODULO2_VARS) {
  VAR_KEY_MAP[v.key] = v.nomeColuna;
}
for (const v of MODULO6_VARS) {
  VAR_KEY_MAP[v.key] = v.nomeColuna;
}
