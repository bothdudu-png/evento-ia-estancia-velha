# Cards de Divulgação — AI Experience Estância Velha

## Arquivos criados

| Arquivo | Formato | Uso |
|---|---|---|
| `card-feed-anuncio.html` | 1080×1080 (1:1) | Post de anúncio no Instagram feed |
| `card-feed-roi.html` | 1080×1080 (1:1) | Slide educacional de ROI para carrossel |
| `card-story-anuncio.html` | 1080×1920 (9:16) | Story completo de anúncio |
| `card-story-urgencia.html` | 1080×1920 (9:16) | Story de escassez (edite o número de vagas) |

## Como exportar as imagens

### Opção 1 — Chrome DevTools (mais simples)
1. Abra o arquivo HTML no Chrome (`Ctrl+O`)
2. Abra DevTools (`F12`)
3. Vá em **Toggle Device Toolbar** (ícone de celular) ou pressione `Ctrl+Shift+M`
4. Configure resolução personalizada: **1080 × 1080** (feed) ou **1080 × 1920** (story)
5. Clique com botão direito na página → **Capture screenshot**

### Opção 2 — Extensão do Chrome "Full Page Screen Capture"
Instale a extensão e capture a página inteira na resolução correta.

### Opção 3 — PowerPoint / Canva como base
Importe o HTML via iframe no Canva ou use as cores e layout como referência para recriar no Canva.

## Como editar o número de vagas (`card-story-urgencia.html`)

Abra o arquivo e edite a linha:
```html
<div class="vagas-num">12</div>
```
Mude `12` para o número atual de vagas restantes e recapture.

## Paleta de cores do evento

| Cor | Hex | Uso |
|---|---|---|
| Background | `#050816` | Fundo |
| Roxo neon | `#7c3aed` | Principal |
| Ciano elétrico | `#00f2fe` | Destaque |
| Rosa neon | `#ec4899` | Urgência/CTA |
| Branco | `#ffffff` | Texto principal |
