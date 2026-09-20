# Kanda Supermercado - Assets para Website

Arquivos prontos para uso em sites, favicon e identidade visual.

## Arquivos principais

### Logo completo (identidade)
| Arquivo | Uso recomendado |
|---------|-----------------|
| `kanda-logo-transparent.png` | Logo principal (fundo transparente) |
| `kanda-logo-padded.png` | Logo com margem (melhor para headers) |
| `kanda-logo-exact.svg` | **SVG com fidelidade 100%** (imagem embutida) |
| `kanda-logo-full.svg` | SVG vetorial aproximado (texto + carrinho) |
| `kanda-logo.svg` | SVG vetorial alternativo |

### Ícones / Favicon
| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `favicon.ico` | 16/32/48 | Favicon clássico (coloque na raiz do site) |
| `favicon.svg` | escalável | Favicon moderno (SVG) |
| `kanda-icon.svg` | escalável | Ícone do carrinho (puro) |
| `kanda-icon-16.png` | 16×16 | Favicon |
| `kanda-icon-32.png` | 32×32 | Favicon / taskbar |
| `kanda-icon-48.png` | 48×48 | Windows |
| `kanda-icon-180.png` | 180×180 | Apple Touch Icon |
| `kanda-icon-192.png` | 192×192 | Android / PWA |
| `kanda-icon-512.png` | 512×512 | PWA / Splash |
| `kanda-square.png` | 700×700 | Versão quadrada base |

## Como usar no HTML

```html
<!-- Favicon clássico -->
<link rel="icon" href="/favicon.ico" sizes="any">

<!-- Favicon SVG moderno -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/kanda-icon-180.png">

<!-- Logo no header -->
<img src="/kanda-logo-transparent.png" alt="Kanda Supermercado" height="48">

<!-- Ou usando o SVG de alta fidelidade -->
<img src="/kanda-logo-exact.svg" alt="Kanda Supermercado" height="48">
```

## Cores oficiais extraídas

- **Laranja (Kanda):** `#F7941D`
- **Verde (Supermercado + Carrinho):** `#2E8B3D`

## Recomendações

1. Use `kanda-logo-exact.svg` ou o PNG transparente quando precisar de **fidelidade visual total**.
2. Use os SVGs vetoriais (`kanda-logo-full.svg` / `kanda-icon.svg`) quando quiser escalabilidade perfeita e arquivo leve.
3. Coloque o `favicon.ico` na raiz do site (`/favicon.ico`).
4. Para PWA, declare também os ícones 192 e 512 no `manifest.json`.
