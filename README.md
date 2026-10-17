# Henrique Valois — portfólio

Portfólio pessoal de **Carlos Henrique Valois dos Santos**, engenheiro de software júnior com foco em back-end Java.
Site estático bilíngue (PT/EN), sem frameworks.

> Desenvolvido com apoio de IA generativa, com direção, curadoria e revisão minhas.

**Ao vivo:** https://henrique-valois.vercel.app

## Destaques técnicos

- HTML, CSS e JavaScript (ES modules) puros, sem dependências em runtime
- i18n PT/EN sem recarregar a página (`?lang=en` força o inglês)
- Paleta de comandos (`Ctrl/⌘ K` ou `/`) e terminal interativo (`help`, `git log`, `sudo contratar`)
- Animações guiadas por scroll com `IntersectionObserver` + `requestAnimationFrame`, respeitando `prefers-reduced-motion`
- Content Security Policy estrita e headers de segurança em `vercel.json`
- Recorte do retrato feito com um script de matting próprio (flood fill + alpha estimado + remoção da cor de fundo)
- Open Graph, JSON-LD (`Person`), sitemap e favicon em SVG

## Estrutura

```
index.html          marcação e textos em português
css/style.css       sistema visual (tokens, layout, responsivo)
js/content.js       todo o conteúdo editável + traduções em inglês
js/main.js          comportamento (i18n, animações, terminal, paleta)
assets/             imagens, ícones e currículos em PDF
cv-src/             fonte HTML dos currículos e da imagem de compartilhamento
tools/              recorte do retrato, render dos PDFs e servidor local (ver tools/README.md)
vercel.json         headers de segurança e cache
```

## Editar conteúdo

Quase tudo está em `js/content.js`: links, stack, jornada e projetos.
Os textos fixos em português ficam no `index.html`; as versões em inglês, no objeto `en` de `content.js`.

## Rodar localmente

Use o servidor do projeto, que aplica os mesmos headers de segurança da produção:

```bash
node tools/serve.mjs . 5173
```

## Deploy

```bash
npx vercel --prod
```

A Vercel roda `node scripts/build.mjs` em todo deploy: o site é copiado para `dist/` e cada URL de CSS,
JS e imagem ganha um hash do conteúdo (`style.css?v=…`). O HTML é sempre revalidado e os arquivos
versionados ficam em cache por um ano, então um F5 comum já mostra a versão nova e o que não mudou
não é baixado de novo.
