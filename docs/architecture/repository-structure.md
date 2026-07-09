# Kanda — Organização do Repositório (Monorepo)
kanda-system/
├── docs/ # (toda esta estrutura)
├── frontend/ # Next.js
│ ├── src/
│ ├── public/
│ └── Dockerfile (opcional, Render pode usar buildpack)
├── backend/ # NestJS
│ ├── src/
│ │ ├── modules/
│ │ │ ├── auth/
│ │ │ ├── products/
│ │ │ ├── categories/
│ │ │ ├── orders/
│ │ │ ├── payments/
│ │ │ ├── customers/
│ │ │ └── internal/ # endpoints para n8n
│ │ └── main.ts
│ ├── prisma/ # migrations + schema
│ └── Dockerfile
├── whatsapp/
│ ├── n8n/
│ │ └── workflows/ # JSON exportado
│ └── waha/
│ └── config/
├── firebase/
│ └── auth-config/ # config pública (sem segredos)
├── scripts/
│ ├── seed-catalog.ts # importa catálogo fictício
│ └── backup-db.sh
├── .github/
│ └── workflows/
│ └── ci.yml # lint + build
├── .env.example
├── .gitignore
└── README.md

text

**Convenções:** Conventional Commits (`feat:`, `fix:`, `docs:`). Branches: `main`, `develop`, `feature/*`.