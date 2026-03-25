import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { APP_TITLE, APP_SUBTITLE } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-24 hero-gradient">
        {/* Hero Section */}
        <section className="mx-auto mb-20 max-w-4xl text-center">
          <h1 className="mb-8 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-text-primary md:text-7xl">
            {APP_TITLE}
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-lg font-light leading-relaxed text-text-secondary md:text-xl">
            {APP_SUBTITLE}
          </p>

          {/* Hero Visual */}
          <div className="glass-card group relative mb-24 aspect-[21/9] w-full overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#85adff]/10 to-transparent mix-blend-overlay" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Visualização de Dados em Rede Neural"
              className="h-full w-full scale-105 object-cover opacity-60 transition-transform duration-1000 group-hover:scale-100"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCusXiFho4042nBiYm-ebflBcMD3ULZ0J-D4rUPC7ZCTFLRQoYjxBuXm_sKIwN6rODmjRDKpyyUKPmFWNxYt_S9hLVwU96s36w-8dOfVF3PvB5JMByF3gTVseqWl4y6HtNGwnVeb4fc8s6B78sVp66cIkH0jYM2t8r8_ElTmwG8x1t-NKOpv1x8rGCyGnXyBej0plwdbLo0zCatWJHqoU1G5alVGdBgHIJtY917eY4PSp5eIh_llhsLihpMLB0pE11rGXbwMTDvkXP4"
            />
          </div>
        </section>

        {/* Data Grid */}
        <div className="space-y-6">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Ativos e Passivos */}
            <Link
              href="/modulos/ativos-passivos"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#85adff]/10 transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-[#85adff]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance_wallet
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Ativos e Passivos
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Visualização em Treemap da composição patrimonial das
                instituições financeiras brasileiras.
              </p>
            </Link>

            {/* Resultado */}
            <Link
              href="/modulos/resultado"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#69f6b8]/10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[#69f6b8]">
                  bar_chart
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Resultado
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Análise detalhada de performance e lucratividade do setor
                bancário nacional.
              </p>
            </Link>

            {/* Crédito PF */}
            <Link
              href="/modulos/credito-pf"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#b299ff]/10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[#b299ff]">
                  person
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Crédito PF
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Operações de crédito voltadas para pessoa física
              </p>
            </Link>
          </div>

          {/* Row 2: 3 cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Crédito PJ */}
            <Link
              href="/modulos/credito-pj"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#b299ff]/10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[#b299ff]">
                  corporate_fare
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Crédito PJ
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Fluxo de capitais e crédito para o setor corporativo e
                industrial.
              </p>
            </Link>

            {/* Taxas de Juros */}
            <Link
              href="/modulos/taxas-juros"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#85adff]/10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[#85adff]">
                  percent
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Taxas de Juros
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Série histórica e comparativos de taxas praticadas por
                modalidades.
              </p>
            </Link>

            {/* Índices */}
            <Link
              href="/modulos/indices"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#69f6b8]/10 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[#69f6b8]">
                  query_stats
                </span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-text-primary">
                Índices
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Principais índices financeiros e de perfomance das entidades
                reguladas
              </p>
            </Link>
          </div>

          {/* Row 3: 2 cards (horizontal layout) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Crédito Regional */}
            <Link
              href="/modulos/credito-regiao"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#85adff]/10 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-[#85adff]">
                    map
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-text-primary">
                    Crédito Regional
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    Distribuição geográfica da oferta de crédito no território
                    nacional.
                  </p>
                </div>
              </div>
            </Link>

            {/* Crédito Total */}
            <Link
              href="/modulos/cartograma"
              className="glass-card group cursor-pointer rounded-xl border border-white/5 p-8 no-underline transition-all hover:bg-[#20262f]"
            >
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#69f6b8]/10 transition-transform group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-[#69f6b8]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    public
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-text-primary">
                    Crédito Total
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    Cartograma com o total de crédito por região do Brasil
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
