#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_ifdata_credit.py — Credit reports from the IF.data website's internal API.

The public olinda OData API (used for the balance-sheet reports) does NOT expose
the credit reports (Carteira de crédito ativa PF/PJ/região) at the Conglomerado
Prudencial level — there they only exist for individual institutions, without the
big banks. The IF.data website itself uses a separate internal JSON API
(www3.bcb.gov.br/ifdata/rest/arquivos) with institution-type id 1009 (Prudencial),
which DOES include the big banks. This module reconstructs that data the same way
the website's JavaScript does and writes it as Parquet in the app's credit format.

Data model (per data-base `dt`):
  - cadastro{dt}_1009.json : institutions. c0=CodInst, c2=name, c3=Tcb, c12=Sr.
  - info{dt}.json          : column dictionary. id -> {n(name), lid, a(dados file), td}.
  - dados{dt}_N.json       : {id:N, values:[{e:CodInst, v:[{i:lid, v:value}]}]}.
  - trel{dt}_{relId}.json  : report layout. c[] columns (hierarchical via `sc`),
                             each leaf referencing a column via `ifd` -> info id.
  A value is looked up by (entity=CodInst, column=lid) in the dados file `a`.
"""

import json
import time
import bisect
import urllib.request
import pandas as pd

BASE = "https://www3.bcb.gov.br/ifdata/rest/arquivos?nomeArquivo=ifdata_2025_2030//{dt}/{fn}"

# app report number -> IF.data internal trel id (Conglomerado Prudencial, 1009)
REST_REPORT_IDS = {9: 126, 11: 123, 13: 128}  # 9=Região, 11=PF, 13=PJ
CREDIT_TIPO = 1009


def _fetch_json(dt, fn, retries=6):
    url = BASE.format(dt=dt, fn=fn)
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"failed to fetch {fn}: {last}")


def _leaf_value_finder(dados):
    """Return findVal(dadosFileId, codInst, lid) -> float | None."""
    # pre-sort for binary search (mirrors the website's binarySearch)
    index = {}
    for file_id, values in dados.items():
        values.sort(key=lambda x: x["e"])
        entities = [x["e"] for x in values]
        for row in values:
            row["v"].sort(key=lambda x: x["i"])
        index[file_id] = (entities, values)

    def find(file_id, e, i):
        pack = index.get(file_id)
        if pack is None:
            return None
        entities, values = pack
        p = bisect.bisect_left(entities, e)
        if p >= len(entities) or entities[p] != e:
            return None
        cols = values[p]["v"]
        ii = [c["i"] for c in cols]
        q = bisect.bisect_left(ii, i)
        if q >= len(ii) or ii[q] != i:
            return None
        return cols[q]["v"]

    return find


def fetch_credit(anomes, data_dir, log=None):
    """Reconstruct the three credit reports for `anomes` and write Parquet files:
       - cadastro_credito_{anomes}.parquet
       - valores_{anomes}_t1009_r{9,11,13}.parquet
    """
    def _log(msg):
        if log:
            log.info(msg)

    _log(f"  Credit (IF.data internal API, tipo=1009) for {anomes}...")
    info = _fetch_json(anomes, f"info{anomes}.json")
    info_by_id = {x["id"]: x for x in info}
    cad = _fetch_json(anomes, f"cadastro{anomes}_1009.json")

    dados = {}
    for n in range(1, 6):
        d = _fetch_json(anomes, f"dados{anomes}_{n}.json")
        dados[d["id"]] = d["values"]
    find = _leaf_value_finder(dados)

    # institution registry (prudential codes)
    cad_rows = [
        {
            "CodInst": str(c.get("c0", "")),
            "NomeInstituicao": c.get("c2", ""),
            "Tcb": c.get("c3", ""),
            "Sr": c.get("c12", ""),
        }
        for c in cad
    ]
    pd.DataFrame(cad_rows).to_parquet(
        f"{data_dir}/cadastro_credito_{anomes}.parquet", index=False
    )
    codes = [(str(c.get("c0", "")), int(c["c0"])) for c in cad if str(c.get("c0", "")).isdigit()]

    for app_num, trel_id in REST_REPORT_IDS.items():
        trel = _fetch_json(anomes, f"trel{anomes}_{trel_id}.json")
        rows = []
        for col in trel["c"]:
            ie = info_by_id.get(col["ifd"], {})
            name = ie.get("n", "")
            subs = col.get("sc") or []
            if subs:
                # modality group -> use its "Total" sub-column
                total_sub = next(
                    (s for s in subs if info_by_id.get(s["ifd"], {}).get("n") == "Total"),
                    None,
                )
                if not total_sub:
                    continue
                tie = info_by_id[total_sub["ifd"]]
                if tie.get("td") != 3:
                    continue
                for cstr, cint in codes:
                    v = find(tie["a"], cint, tie["lid"])
                    if v:
                        rows.append({"CodInst": cstr, "Grupo": name, "NomeColuna": "Total", "Saldo": float(v)})
            elif ie.get("td") == 3:
                # direct value leaf (portfolio totals, regions)
                for cstr, cint in codes:
                    v = find(ie["a"], cint, ie["lid"])
                    if v:
                        rows.append({"CodInst": cstr, "Grupo": "", "NomeColuna": name, "Saldo": float(v)})
        df = pd.DataFrame(rows)
        fname = f"{data_dir}/valores_{anomes}_t{CREDIT_TIPO}_r{app_num}.parquet"
        df.to_parquet(fname, index=False)
        _log(f"    Saved r{app_num} ({len(df)} rows, {df['CodInst'].nunique() if len(df) else 0} institutions)")
    return True


if __name__ == "__main__":
    import sys
    from pathlib import Path
    logging_dir = Path(__file__).resolve().parent.parent / "data"
    q = int(sys.argv[1]) if len(sys.argv) > 1 else 202603
    fetch_credit(q, str(logging_dir))
    print("done")
