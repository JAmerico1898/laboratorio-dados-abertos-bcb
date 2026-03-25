import ModuleHeader from "@/components/layout/ModuleHeader";
import { SEGMENT_COLORS } from "@/lib/constants";
import type { Segment } from "@/lib/types";

const SEGMENTS_SR: { key: Segment; name: string; desc: string }[] = [
  {
    key: "S1",
    name: "Segmento 1",
    desc: "Bancos múltiplos, bancos comerciais, bancos de investimento, bancos de câmbio e caixas econômicas com porte superior a 10% do PIB; ou com atividade internacional relevante.",
  },
  {
    key: "S2",
    name: "Segmento 2",
    desc: "Bancos de porte entre 1% e 10% do PIB; demais instituições autorizadas de porte igual ou superior a 1% do PIB.",
  },
  {
    key: "S3",
    name: "Segmento 3",
    desc: "Instituições de porte entre 0,1% e 1% do PIB.",
  },
  {
    key: "S4",
    name: "Segmento 4",
    desc: "Instituições de porte inferior a 0,1% do PIB.",
  },
];

const SEGMENTS_TCB: { key: Segment; name: string; desc: string }[] = [
  {
    key: "N1",
    name: "Não bancário de Crédito",
    desc: "Instituições não bancárias que operam predominantemente com crédito (financeiras, SCDs, SEPs etc.).",
  },
  {
    key: "N2",
    name: "Não bancário do Mercado de Capitais",
    desc: "Instituições não bancárias que operam predominantemente no mercado de capitais (corretoras, distribuidoras etc.).",
  },
  {
    key: "N4",
    name: "Instituições de Pagamento",
    desc: "Instituições de pagamento autorizadas pelo Banco Central (emissores de moeda eletrônica, credenciadoras etc.).",
  },
];

function SegCard({
  seg,
  name,
  desc,
}: {
  seg: Segment;
  name: string;
  desc: string;
}) {
  const color = SEGMENT_COLORS[seg];
  return (
    <div className="mb-2.5 rounded-[10px] border border-border/60 bg-bg-surface/80 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block rounded-md px-2.5 py-0.5 font-mono text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {seg}
        </span>
        <strong className="text-text-primary">{name}</strong>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
        {desc}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-[12px] border border-border bg-bg-surface/60 px-7 py-6">
      <h3 className="mb-3.5 border-b border-accent-cyan/15 pb-2 text-lg font-bold text-accent-cyan">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-r-lg border-l-[3px] border-accent-cyan bg-accent-cyan/[0.06] px-4 py-3 text-sm leading-relaxed text-text-secondary">
      {children}
    </div>
  );
}

export default function SobrePage() {
  return (
    <>
      <ModuleHeader
        icon="ℹ️"
        title="Sobre o App"
        subtitle="Fontes de dados, metodologia, segmentação e referências"
      />

      <Section title="📡 Fonte de Dados">
        <p className="text-sm leading-relaxed text-text-secondary">
          Os dados utilizados neste aplicativo são obtidos diretamente do{" "}
          <strong className="text-text-primary">
            Portal de Dados Abertos do Banco Central do Brasil
          </strong>{" "}
          por meio de duas APIs:
        </p>
        <ul className="my-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text-secondary">
          <li>
            <strong className="text-text-primary">IF.data</strong> — dados
            contábeis das instituições financeiras (balanço patrimonial,
            resultado, carteira de crédito, dados regionais). Dados{" "}
            <strong>trimestrais</strong> (mar, jun, set, dez).
          </li>
          <li>
            <strong className="text-text-primary">TaxaJuros</strong> — taxas de
            juros praticadas pelas instituições financeiras. Frequência{" "}
            <strong>diária</strong> (maioria) ou <strong>mensal</strong>{" "}
            (financiamento imobiliário).
          </li>
        </ul>
        <Note>
          <strong>Periodicidade:</strong> Os dados do IF.data refletem a posição
          contábil do último dia de cada trimestre. A publicação ocorre com
          defasagem de aproximadamente 2 a 3 meses após o fechamento.
        </Note>
      </Section>

      <Section title="🏛️ Segmentação das Instituições Financeiras">
        <p className="mb-4 text-sm leading-relaxed text-text-secondary">
          As instituições são classificadas pelo Banco Central conforme a{" "}
          <strong className="text-text-primary">
            Resolução nº 4.553/2017
          </strong>
          :
        </p>

        <h4 className="mb-2 text-sm font-bold text-text-primary">
          Segmentos SR (Resolução nº 4.553/2017)
        </h4>
        {SEGMENTS_SR.map((s) => (
          <SegCard key={s.key} seg={s.key} name={s.name} desc={s.desc} />
        ))}

        <h4 className="mb-2 mt-4 text-sm font-bold text-text-primary">
          Categorias TCB (Não-bancários)
        </h4>
        {SEGMENTS_TCB.map((s) => (
          <SegCard key={s.key} seg={s.key} name={s.name} desc={s.desc} />
        ))}

        <Note>
          <strong>Filtro utilizado:</strong> O aplicativo exibe instituições com
          visão <strong>PRUDENCIAL</strong> (consolidada), aplicando filtros de
          materialidade: Ativo Total ≥ R$ 100 milhões e PL ≥ R$ 20 milhões. A
          seleção padrão é S1 e S2.
        </Note>
      </Section>

      <Section title="📐 Metodologia e Notas">
        <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
          <div>
            <strong className="text-text-primary">
              Anualização do Resultado (Módulo 2):
            </strong>{" "}
            Variáveis de resultado são somadas nos 4 últimos trimestres. Ex.:
            Set/2025 = Dez/2024 + Mar/2025 + Jun/2025 + Set/2025.
          </div>
          <div>
            <strong className="text-text-primary">
              Valores monetários:
            </strong>{" "}
            Todos os valores do IF.data são em Reais (R$), na unidade original
            da API. A exibição converte para milhões (mi) ou bilhões (bi).
          </div>
          <div>
            <strong className="text-text-primary">
              Índices Financeiros (Módulo 7):
            </strong>{" "}
            Calculados a partir de variáveis do balanço e resultado. O Índice de
            Basileia é reportado diretamente pela API. Os demais são derivados.
          </div>
          <div>
            <strong className="text-text-primary">
              Taxas de Juros (Módulo 5):
            </strong>{" "}
            Reportadas pelas IFs ao BCB, em % ao ano. Rankings consideram a data
            mais recente disponível.
          </div>
          <div>
            <strong className="text-text-primary">
              Cartograma (Módulo 8):
            </strong>{" "}
            Círculos proporcionais (Dorling) nos centróides aproximados de cada
            região. Área proporcional ao volume de crédito.
          </div>
        </div>
      </Section>

      <Section title="❓ Perguntas Frequentes">
        <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
          <div>
            <strong className="text-text-primary">
              Por que algumas instituições não aparecem?
            </strong>
            <br />
            Filtros de materialidade (AT ≥ R$ 100 mi, PL ≥ R$ 20 mi) e visão
            PRUDENCIAL. Instituições pequenas ou sem dados não aparecem.
          </div>
          <div>
            <strong className="text-text-primary">
              Os dados estão desatualizados?
            </strong>
            <br />
            Dados do IF.data possuem defasagem de 2-3 meses. O app busca
            automaticamente o trimestre mais recente. Taxas de juros são mais
            atuais.
          </div>
          <div>
            <strong className="text-text-primary">
              O que significa &quot;visão PRUDENCIAL&quot;?
            </strong>
            <br />
            Visão consolidada que agrupa entidades do mesmo conglomerado,
            evitando dupla contagem entre subsidiárias.
          </div>
          <div>
            <strong className="text-text-primary">
              Posso baixar os dados?
            </strong>
            <br />
            Todos os dados são públicos e acessíveis via{" "}
            <a
              href="https://dadosabertos.bcb.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline"
            >
              dadosabertos.bcb.gov.br
            </a>
            .
          </div>
        </div>
      </Section>
    </>
  );
}
