# SPEC-02: Hub Page & Shared Components

## Hub Page (`/app/page.tsx`)

### Layout
- Centered hero section with animated API badge, title "Laboratório de Dados Públicos", subtitle
- 4-column grid of 8 module cards (2 rows of 4)
- Below cards: 4-column grid with "Sobre o App" in col 2, "Sugestões e Feedback" in col 3 (matching card width)
- Footer with BCB attribution

### API Badge
- Pill-shaped: "API DADOS ABERTOS BCB"
- Pulsing green dot + cyan border + cyan text on dark bg
- Font: Space Mono, 11px, 700 weight, letter-spacing 0.08em

### Module Cards (`/components/hub/ModuleCard.tsx`)
Props: `{ icon: string, title: string, description: string, vizType: string, href: string }`
- Background: `--bg-card` (#111827)
- Border: 1px `--border-color`, 16px radius
- On hover: border → `--border-hover`, background → `--bg-card-hover`, translateY(-2px), cyan gradient line at top (opacity 0→1)
- Icon: 2rem emoji in rounded container with cyan dim background
- Title: Space Grotesk, 1.05rem, 700 weight, white
- Description: 0.82rem, muted text
- Badge: pill at bottom — "TREEMAP" (cyan), "BARRAS" (amber), "CARTOGRAMA" (emerald), "CUSTOM" (violet)
- **The entire card is a link** (Next.js `<Link>` wrapping the card)
- No separate button — clicking the card navigates

### Action Buttons
- Two secondary-style buttons in the 4-column grid (cols 2 and 3)
- Style: `--bg-card` background, `--border-color` border, light text
- Hover: border → cyan, text → cyan, bg → `--bg-card-hover`

## TopBar (`/components/layout/TopBar.tsx`)
- Left: LDP badge (cyan gradient, dark text, 10px radius) + app title/subtitle
- Right: Back button "← Home" (visible only when not on hub, links to `/`)
- Separator: `<hr>` with `--border-color`

## Footer (`/components/layout/Footer.tsx`)
- Centered text: "Dados: dadosabertos.bcb.gov.br · IF.Data API · python-bcb"
- "Desenvolvido para fins educacionais — COPPEAD/UFRJ"
- Font: Space Mono, 12px, `--text-muted`
- Cyan links

## ModuleHeader (`/components/layout/ModuleHeader.tsx`)
Props: `{ icon: string, title: string, subtitle: string }`
- Flex row: icon (2rem, cyan dim background, 14px radius) + title column
- Title: Space Grotesk, 1.5rem, 700, white
- Subtitle: 0.85rem, muted

## Root Layout (`/app/layout.tsx`)
- HTML `lang="pt-BR"`
- Dark background on body: `bg-[#0a0f1a]`
- Load Space Grotesk + Space Mono via next/font/google
- Set CSS variables in `:root`
- Metadata: title "Laboratório de Dados Públicos", description, icon 🏦
- Max-width container: 1200px centered
