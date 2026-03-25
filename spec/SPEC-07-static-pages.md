# SPEC-07: Static Pages (Sobre o App & Feedback)

## Sobre o App (`/modulos/sobre`)

### Page Structure
Static content page with 4 sections. No data fetching.

**Section 1: Fonte de Dados**
- Styled card with cyan header "📡 Fonte de Dados"
- Explains IF.data (quarterly financial statements) and TaxaJuros (daily/monthly rates) APIs
- Note box (cyan left border): explains quarterly publication lag (2-3 months)

**Section 2: Segmentação das Instituições Financeiras**
- Header: "🏛️ Segmentação das Instituições Financeiras"
- Reference: Resolução nº 4.553/2017

**SR Segments** (4 cards with colored badges):
| Badge | Color | Name | Description |
|-------|-------|------|-------------|
| S1 | #0891b2 | Segmento 1 | Bancos com porte >10% PIB ou atividade internacional relevante |
| S2 | #059669 | Segmento 2 | Porte 1-10% PIB + demais IFs ≥ 1% PIB |
| S3 | #d97706 | Segmento 3 | Porte 0.1-1% |
| S4 | #7c3aed | Segmento 4 | Porte <0.1% |

**TCB Categories** (3 cards):
| Badge | Color | Name | Description |
|-------|-------|------|-------------|
| N1 | #e11d48 | Não bancário de Crédito | Financeiras, SCDs, SEPs |
| N2 | #f97316 | Não bancário do Mercado de Capitais | Corretoras, distribuidoras |
| N4 | #38bdf8 | Instituições de Pagamento | Emissores de moeda eletrônica, credenciadoras |

- Note box: explains PRUDENCIAL filter, materiality thresholds, default segments

**Section 3: Metodologia e Notas** (Markdown rendered)
- Annualization of DRE (sum 4 quarters, example with specific dates)
- Monetary values (BRL, raw integers, auto-format to mi/bi)
- Financial indices (derived from balance sheet + DRE, Basileia direct from API)
- Interest rates (reported by IFs, % a.a., rankings use most recent date)
- Cartogram (Dorling circles, area proportional to credit volume)

**Section 4: Perguntas Frequentes** (Markdown rendered)
- Why some institutions don't appear (materiality filter + PRUDENCIAL)
- Data freshness (2-3 month lag, auto-detection of latest quarter)
- What "visão PRUDENCIAL" means (consolidated view, no double counting)
- Can I download data (Module 5 download tab + public BCB portal link)

### Styling
- Section containers: `bg-[#0f172a]/60` with cyan border, 12px radius, 24px padding
- Segment cards: darker bg, thin border, badge pill + description
- Note boxes: cyan left border, subtle bg

## Feedback (`/modulos/feedback`)

### Page Structure
Form with optional name/email, type selector, message textarea, submit button.

**Fields:**
1. Name (optional) — text input, placeholder "Ex.: Maria Silva"
2. Email (optional) — text input, placeholder "Ex.: maria@email.com"
3. Type — select: "💡 Sugestão", "❓ Dúvida", "🐛 Bug", "⭐ Elogio"
4. Message (required) — textarea, 150px height
5. Submit button "📤 Enviar" — full width, primary style

**On Submit:**
- Validate: message must not be empty
- Build message body with type, name, email, timestamp
- **Pushover integration** (optional): POST to `https://api.pushover.net/1/messages.json` with token/user from environment variables (`PUSHOVER_API_TOKEN`, `PUSHOVER_USER_KEY`)
- Success: show green toast "✅ Enviado com sucesso!"
- No Pushover configured: show info "📝 Mensagem registrada."

### Next.js Implementation
- Use a Server Action or API route (`/api/feedback`) to handle the Pushover POST (keeps secrets server-side)
- Form uses React state, not HTML form (no page refresh)
- Environment variables in `.env.local` / Vercel env vars
