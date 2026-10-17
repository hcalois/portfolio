# Ferramentas

Scripts usados para produzir os assets do site. Nada desta pasta é publicado (veja `.vercelignore`).

```bash
cd tools
npm install
```

## Recorte do retrato

`source/retrato-original.jpg` veio com o fundo xadrez "transparente" pintado dentro do JPG, então não
havia canal alfa de verdade. O recorte é feito em três passos, sem IA:

1. **Flood fill** a partir das bordas sobre pixels neutros e claros (o xadrez), mais os "bolsões"
   de fundo presos entre os cachos do cabelo.
2. **Remoção do halo** cinza deixado por um recorte antigo, crescendo a máscara sobre cinzas neutros.
3. **Alfa estimado** numa faixa fina da borda, a partir das médias locais de fundo e de primeiro plano,
   e **remoção da cor de fundo** dos pixels de borda (sem franja branca sobre o preto).

`matte.mjs` também repinta um reflexo claro no maxilar com o tom de pele ao redor. As coordenadas
dessas regiões são específicas desta foto.

```bash
node image/matte.mjs   source/retrato-original.jpg ../tmp/cut.png   # recorte com alfa
node image/preview.mjs ../tmp/cut.png ../tmp/pv                     # conferir bordas sobre preto e vermelho
node image/export.mjs  ../tmp/cut.png ../assets/img                 # versões P&B e cor, 1600px e 900px
```

`export.mjs` aplica a luz de contorno e a curva do P&B tonalizado em tom "osso".
`probe.mjs` mostra as cores dominantes do fundo e serviu para calibrar os limiares.
`source/referencia-marca.jpg` é a arte original de onde saiu o verde-limão da marca (`#d6f23a`).

## Currículos e imagem de compartilhamento

Os currículos e a imagem do Open Graph são HTML em `cv-src/`, impressos com o Edge headless:

```bash
powershell -ExecutionPolicy Bypass -File tools/render.ps1
node tools/image/icons.mjs assets tools/og.png   # og.jpg + apple-touch-icon.png
```

## Servidor local

```bash
node tools/serve.mjs . 5173
```

Serve o site com os mesmos headers de segurança do `vercel.json` (CSP incluída), para pegar
violações antes do deploy.
