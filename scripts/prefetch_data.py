#!/usr/bin/env python3
"""
prefetch_data.py - Pre-fetch all BCB data (IFDATA + TaxaJuros) as Parquet.

Usage:
    python scripts/prefetch_data.py

Output:
    data/*.parquet + data/latest_quarter.txt + data/manifest.json
"""

import sys
import json
import time
import logging
from datetime import date, datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("prefetch")


def find_latest_quarter_raw():
    from bcb.odata import IFDATA
    ifdata = IFDATA()
    ep = ifdata.get_endpoint("IfDataValores")

    today = date.today()
    y, m = today.year, today.month
    candidates = []
    for _ in range(8):
        q_month = ((m - 1) // 3) * 3 + 3
        candidates.append(y * 100 + q_month)
        m -= 3
        if m <= 0:
            m += 12
            y -= 1

    for anomes in candidates:
        for tipo in [1, 2]:
            try:
                df = ep.get(AnoMes=anomes, TipoInstituicao=tipo, Relatorio=1)
                if df is not None and not df.empty:
                    log.info(f"Latest quarter: {anomes} (tipo={tipo})")
                    return anomes
            except Exception:
                continue

    raise RuntimeError("Could not find any available quarter")


def get_last_n_quarters(anomes, n=4):
    year = anomes // 100
    month = anomes % 100
    quarters = []
    for _ in range(n):
        quarters.append(year * 100 + month)
        month -= 3
        if month <= 0:
            month += 12
            year -= 1
    return quarters


def fetch_and_save_valores(ep, anomes, tipo, relatorio, max_retries=3):
    fname = f"valores_{anomes}_t{tipo}_r{relatorio}.parquet"
    fpath = DATA_DIR / fname

    for attempt in range(max_retries):
        try:
            df = ep.get(AnoMes=anomes, TipoInstituicao=tipo, Relatorio=relatorio)
            if df is not None and not df.empty:
                df.to_parquet(fpath, index=False)
                log.info(f"  Saved {fname} ({len(df)} rows)")
                return True
            else:
                log.warning(f"  Empty: {fname}")
                return False
        except Exception as e:
            log.warning(f"  Attempt {attempt+1}/{max_retries} failed for {fname}: {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
            else:
                log.error(f"  FAILED after {max_retries} attempts: {fname}")
                return False


def fetch_and_save_cadastro(ep_cad, anomes, max_retries=3):
    fname = f"cadastro_{anomes}.parquet"
    fpath = DATA_DIR / fname

    for attempt in range(max_retries):
        try:
            df = ep_cad.get(AnoMes=anomes)
            if df is not None and not df.empty:
                df.to_parquet(fpath, index=False)
                log.info(f"  Saved {fname} ({len(df)} rows)")
                return True
        except Exception as e:
            log.warning(f"  Attempt {attempt+1}/{max_retries} failed for cadastro: {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
    return False


# ─────────────────────────────────────────────
# TAXAS DE JUROS
# ─────────────────────────────────────────────

# Exact modality names from the BCB API
TAXAS_DIARIAS = [
    "Cheque especial - Prefixado",
    "Cartão de crédito - rotativo total - Prefixado",
    "Crédito pessoal consignado privado - Prefixado",
    "Crédito pessoal consignado público - Prefixado",
    "Crédito pessoal consignado INSS - Prefixado",
    "Crédito pessoal não consignado - Prefixado",
    "Aquisição de veículos - Prefixado",
    "Capital de giro com prazo até 365 dias - Prefixado",
    "Capital de giro com prazo até 365 dias - Pós-fixado referenciado em juros flutuantes",
    "Capital de giro com prazo superior a 365 dias - Prefixado",
    "Capital de giro com prazo superior a 365 dias - Pós-fixado referenciado em juros flutuantes",
    "Conta garantida - Prefixado",
    "Conta garantida - Pós-fixado referenciado em juros flutuantes",
    "Desconto de duplicatas - Prefixado",
    "Desconto de cheques - Prefixado",
    "Antecipação de faturas de cartão de crédito - Prefixado",
    "Aquisição de outros bens - Prefixado",
    "Arrendamento mercantil de veículos - Prefixado",
    "Vendor - Prefixado",
    "Adiantamento sobre contratos de câmbio (ACC) - Pós-fixado referenciado em moeda estrangeira",
    "Cartão de crédito - parcelado - Prefixado",
]

TAXAS_MENSAIS = [
    "Financiamento imobiliário com taxas de mercado - Prefixado",
    "Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em IPCA",
    "Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em TR",
    "Financiamento imobiliário com taxas reguladas - Prefixado",
    "Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em IPCA",
    "Financiamento imobiliário com taxas reguladas - Pós-fixado referenciado em TR",
]


def slugify(name):
    import re
    s = name.lower()
    for old, new in [("é","e"),("á","a"),("ã","a"),("â","a"),("í","i"),
                      ("ó","o"),("ú","u"),("ç","c"),("ê","e"),("ô","o")]:
        s = s.replace(old, new)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")[:80]


def fetch_taxas_juros():
    from bcb import TaxaJuros

    log.info("Fetching Taxas de Juros (diarias)...")
    for mod in TAXAS_DIARIAS:
        slug = slugify(mod)
        fpath = DATA_DIR / f"taxas_d_{slug}.parquet"
        try:
            em = TaxaJuros()
            ep = em.get_endpoint("TaxasJurosDiariaPorInicioPeriodo")
            df = (
                ep.query()
                .filter(ep.Modalidade == mod)
                .orderby(ep.InicioPeriodo.desc())
                .limit(200000)
                .collect()
            )
            if df is not None and not df.empty:
                df.to_parquet(fpath, index=False)
                log.info(f"  Saved taxas_d_{slug}.parquet ({len(df)} rows)")
            else:
                log.warning(f"  Empty: {mod}")
            time.sleep(2)
        except Exception as e:
            log.error(f"  Error: {mod} -> {e}")

    log.info("Fetching Taxas de Juros (mensais)...")
    for mod in TAXAS_MENSAIS:
        slug = slugify(mod)
        fpath = DATA_DIR / f"taxas_m_{slug}.parquet"
        try:
            em = TaxaJuros()
            ep = em.get_endpoint("TaxasJurosMensalPorMes")
            df = (
                ep.query()
                .filter(ep.Modalidade == mod)
                .orderby(ep.Mes.desc())
                .limit(200000)
                .collect()
            )
            if df is not None and not df.empty:
                df.to_parquet(fpath, index=False)
                log.info(f"  Saved taxas_m_{slug}.parquet ({len(df)} rows)")
            else:
                log.warning(f"  Empty: {mod}")
            time.sleep(2)
        except Exception as e:
            log.error(f"  Error: {mod} -> {e}")


def main():
    start = time.time()
    log.info("=" * 60)
    log.info("PREFETCH DATA — Laboratorio de Dados Publicos")
    log.info("=" * 60)

    # 1. Find latest quarter
    log.info("Step 1: Finding latest quarter...")
    latest = find_latest_quarter_raw()
    quarters = get_last_n_quarters(latest, n=4)
    log.info(f"  Latest: {latest}, Quarters: {quarters}")

    (DATA_DIR / "latest_quarter.txt").write_text(str(latest))

    # 2. Setup API
    from bcb.odata import IFDATA
    ifdata = IFDATA()
    ep_val = ifdata.get_endpoint("IfDataValores")
    ep_cad = ifdata.get_endpoint("IfDataCadastro")

    # 3. Cadastro
    log.info(f"Step 2: Fetching Cadastro ({latest})...")
    fetch_and_save_cadastro(ep_cad, latest)

    # 4. Valores — all reports, latest quarter, tipo=1
    reports = [
        (1, "Resumo"), (2, "Ativo"), (3, "Passivo"), (4, "DRE"),
        (9, "Credito Geo"), (11, "Credito PF"), (13, "Credito PJ"),
    ]

    log.info(f"Step 3: Fetching Valores tipo=1 ({latest})...")
    for rel, name in reports:
        log.info(f"  Relatorio {rel} ({name})...")
        fetch_and_save_valores(ep_val, latest, tipo=1, relatorio=rel)
        time.sleep(1)

    # 5. Tipo 2 for credit reports
    log.info(f"Step 4: Fetching Valores tipo=2 for credit ({latest})...")
    for rel in [11, 13]:
        fetch_and_save_valores(ep_val, latest, tipo=2, relatorio=rel)
        time.sleep(1)

    # 6. Previous quarters (annualization: Resumo + DRE)
    log.info("Step 5: Previous quarters for annualization...")
    for q in quarters[1:]:
        log.info(f"  Quarter {q}:")
        for rel in [1, 4]:
            fetch_and_save_valores(ep_val, q, tipo=1, relatorio=rel)
            time.sleep(1)

    # 7. Taxas de Juros
    log.info("Step 6: Fetching Taxas de Juros...")
    fetch_taxas_juros()

    # 8. Manifest
    manifest = {
        "latest_quarter": latest,
        "quarters": quarters,
        "generated_at": datetime.now().isoformat(),
        "files": sorted([f.name for f in DATA_DIR.glob("*.parquet")]),
    }
    (DATA_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False)
    )

    elapsed = time.time() - start
    n_files = len(list(DATA_DIR.glob("*.parquet")))
    log.info("=" * 60)
    log.info(f"DONE: {n_files} parquet files in {elapsed:.0f}s")
    log.info("=" * 60)


if __name__ == "__main__":
    main()
