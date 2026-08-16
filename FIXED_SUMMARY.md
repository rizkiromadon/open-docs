# open-docs — Ringkasan Perbaikan (P0 → P3)

## P0 — Critical
- [x] **P0-1** Sidebar mobile: drawer off-canvas di bawah `md:`, hamburger di `Topbar`, state dipindah ke `DocsShell` (client component), backdrop klik-untuk-tutup, focus masuk ke drawer saat buka & kembali ke tombol saat tutup, `Escape` untuk menutup, dan auto-close saat route berubah (`usePathname`).
- [x] **P0-2** `loadActiveDocument()` dibungkus `cache()` dari `react` — dedup baca+parse file per request (mis. dipakai bareng oleh `generateMetadata` dan komponen halaman).
- [x] **P0-3** `error.tsx` sudah tidak menampilkan `error.message` mentah di production; pesan generik + log `console.error` di `useEffect`, detail hanya tampil di dev mode.

## P1 — High priority
- [x] **P1-1** Sidebar: tambah search/filter endpoint + shortcut `/`
- [x] **P1-2** Tabs: ARIA pattern lengkap + navigasi keyboard (arrow/Home/End)
- [x] **P1-3** CodeBlock: tombol copy terlihat saat focus/touch + fallback error handling
- [x] **P1-4** Judul tab browser per halaman operasi (`generateMetadata`)
- [x] **P1-5** Halaman 404 diberi link kembali ke beranda
- [x] **P1-6** SchemaView: skema nested bisa collapse/expand
- [x] **P1-7** Hapus dependency `shiki` yang tidak terpakai
- [x] **P1-8** Font Inter & JetBrains Mono benar-benar dimuat via `next/font`

## P2 — Medium priority
- [x] **P2-1** Tambah test suite (vitest) + step test di CI
- [x] **P2-2** Detail error dibuat scrollable & pesan production disamarkan
- [x] **P2-3** Dedup parameter shared vs operation-level (`name`+`in`)
- [x] **P2-4** Pesan eksplisit "no content/body" saat request/response kosong
- [x] **P2-5** Token warna badge (`warning/danger/success`) dipisah dari warna method
- [x] **P2-6** `generateStaticParams` untuk halaman operasi (static generation)

## P3 — Low priority / nice-to-have
- [x] **P3-1** `resolveRefs`: sibling keys di samping `$ref` sekarang di-resolve dan di-merge (override menang di atas hasil deref) sesuai semantik OpenAPI 3.1 / JSON Schema 2020-12. Ditambah unit test kasus sibling `description` override.
- [x] **P3-2** README CI badge: ditandai `<!-- TODO: replace OWNER once repo is published -->` supaya tidak lolos begitu saja sebagai badge mati.
- [x] **P3-3** `IntroductionPage`: kartu "Endpoints" sekarang berisi daftar tag yang bisa diklik (link ke operation pertama di tiap tag), bukan cuma teks jumlah endpoint.

## Detail implementasi P0-1 (mobile sidebar)
- `DocsShell.tsx` → `"use client"`, menyimpan state `isDrawerOpen`, render sidebar statis (`hidden md:block`) di viewport besar dan drawer overlay (`fixed inset-0 md:hidden`) di viewport kecil.
- `Topbar.tsx` menerima prop opsional `onMenuClick`; tombol hamburger (SVG inline, tanpa dependency baru) hanya muncul `md:hidden`.
- Drawer: backdrop `<button>` transparan menutup saat diklik, `role="dialog"` + `aria-modal="true"`, fokus dipindah ke drawer saat terbuka dan dikembalikan ke elemen pemicu saat ditutup, serta `Escape` key handler.
- Auto-close saat pindah halaman via `usePathname()` di dalam `useEffect`.

## Catatan
Belum sempat dijalankan `npm install/lint/tsc/test/build` di lingkungan ini (tidak ada akses jaringan) — sudah direview manual per file (termasuk cross-check semua item di `AUDIT_AND_FIX_PLAN.md`), tapi tetap perlu diverifikasi di environment kamu sebelum deploy:

```
npm install
npm run lint && npx tsc --noEmit && npm test && npm run build
```

Semua item P0–P3 di `AUDIT_AND_FIX_PLAN.md` kini sudah dikerjakan.
