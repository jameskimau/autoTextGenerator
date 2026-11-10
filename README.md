# autoTextGenerator

Internal tool for an immigration practice: pick the documents a client needs, add per-document or per-section questions, preview, and copy a ready-to-paste request (rich text for Gmail + plain text). UI and output are in Thai.

- No backend — the document list, saved questions and the current draft live in the browser's `localStorage`. Use **แก้ไขรายการ → ส่งออกรายการ (JSON)** to back up or move to another device.
- Default document list: `src/lib/default-catalog.ts`
- Text/HTML generation: `src/lib/generate.ts`

## Stack
Next.js 16 · Tailwind v4 · shadcn/ui (Base UI) · zustand · vitest

## Development
```bash
npm install
npm run dev     # http://localhost:3000
npm test
npm run build
```

Deploy by importing the repo in Vercel (no environment variables needed).
