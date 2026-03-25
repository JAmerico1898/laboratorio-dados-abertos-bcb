# SPEC-08: Deployment & CI/CD

## Vercel Deployment

### Configuration
- Framework: Next.js (auto-detected)
- Build command: `next build`
- Output directory: `.next`
- Node.js version: 18.x+
- Environment variables (optional): `PUSHOVER_API_TOKEN`, `PUSHOVER_USER_KEY`

### Important: Parquet files in repo
The `/data` directory contains ~40 Parquet files (total ~50-100MB). These are committed to the repo and deployed with the app. Vercel's serverless functions can read them from the filesystem at `process.cwd() + '/data/'`.

**Potential issue**: Vercel serverless functions have a 250MB unzipped size limit. If Parquet files + node_modules exceed this, consider:
1. Using Vercel's `outputFileTracingIncludes` in next.config.js to ensure `/data` is included
2. Or moving to Vercel Blob Storage (future optimization)

```javascript
// next.config.js
module.exports = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': ['./data/**'],
    },
  },
};
```

### API Route Cold Starts
- First request to each API route will be slow (Parquet parsing)
- Subsequent requests benefit from Vercel's function caching
- Consider adding `Cache-Control` headers to API responses:
  ```typescript
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' }
  });
  ```

## GitHub Actions (unchanged from Streamlit)

### Workflow: `.github/workflows/prefetch.yml`
- **Schedule**: Day 1 and Day 3 of each month at 06:00 UTC
- **Manual trigger**: `workflow_dispatch`
- Runs `python scripts/prefetch_data.py`
- Commits Parquet files to `/data`
- Git push triggers Vercel auto-deploy

### Prefetch Script: `scripts/prefetch_data.py`
- No changes needed for Next.js migration
- Same Python script, same Parquet output
- Same manifest.json and latest_quarter.txt

### Workflow Permissions
- Repository Settings → Actions → General → Workflow permissions → "Read and write permissions"

## Package.json Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-plotly.js": "^2.6.0",
    "plotly.js": "^2.27.0",
    "parquetjs-lite": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

**Note on Plotly bundle size**: `plotly.js` is ~3MB. Use `plotly.js-dist-min` or dynamic import:
```typescript
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
```

## Migration Checklist
1. [ ] `npx create-next-app@latest` with TypeScript + Tailwind + App Router
2. [ ] Port `/lib/constants.ts` from `config.py`
3. [ ] Port `/lib/formatting.ts` from `config.py` formatting functions
4. [ ] Port `/lib/types.ts` — all interfaces
5. [ ] Implement `/lib/data.ts` — Parquet reading
6. [ ] Implement `/api/quarter/route.ts`
7. [ ] Implement `/api/ifdata/[report]/route.ts`
8. [ ] Implement `/api/taxas/[slug]/route.ts`
9. [ ] Implement `/api/indices/route.ts`
10. [ ] Build shared components (TopBar, Footer, ModuleHeader, etc.)
11. [ ] Build hub page
12. [ ] Build treemap modules (1, 2, 3, 4, 6) — start with Module 1 as template
13. [ ] Build Module 5 (Taxas de Juros)
14. [ ] Build Module 7 (Índices)
15. [ ] Build Module 8 (Cartograma)
16. [ ] Build static pages (Sobre, Feedback)
17. [ ] Copy `/data` directory and `/scripts` from Streamlit repo
18. [ ] Copy `.github/workflows/prefetch.yml`
19. [ ] Configure Vercel deployment
20. [ ] Test all modules end-to-end
