# STORYBOARD.md — AI Experience Social Ad · 15s Portrait

## Formato Final
- Resolução: 1080 × 1920 (Portrait)
- FPS: 30
- Duração: 15s (450 frames)
- Beats: 4

---

## Beat 1 — HOOK · 0s–3s (frames 0–90)

### Visual
- Fundo: `#050816` sólido
- Ambient glow: círculo roxo `#7c3aed` opacity 0.15, 600px, centro-baixo
- Ambient glow: círculo cyan `#00f2fe` opacity 0.10, 400px, topo-direita

### Animação
- Frame 0–15: tela preta absoluta (flash de entrada)
- Frame 15–60: texto principal aparece letra por letra (typewriter) com cursor piscando
- Frame 60–90: texto estável com leve pulse glow em branco

### Texto
```
[centro vertical, padding 80px]
fonte: monospace, 0.85rem, uppercase, color #9ca3af, tracking 0.2em
"IMERSÃO DE IA · ESTÂNCIA VELHA"

fonte: sans-serif, 3.2rem, weight 900, uppercase, color #ffffff, line-height 1.1
"E SE VOCÊ PUDESSE CRIAR SEU PRÓPRIO APP"

fonte: sans-serif, 3.2rem, weight 900, uppercase
color: linear-gradient(135deg, #7c3aed, #00f2fe)
"HOJE?"
```

### Camadas (baixo → cima)
1. Rect fill `#050816`
2. Glow roxo (ellipse blur)
3. Glow cyan (ellipse blur)
4. Texto label
5. Texto headline
6. Texto destaque gradiente

---

## Beat 2 — MÉTODO · 3s–7s (frames 90–210)

### Transição
- Glitch cut de 4 frames: linha horizontal riscando a tela de cima para baixo em cyan

### Visual
- Fundo: `#050816`
- Grid de linhas técnicas horizontais `rgba(255,255,255,0.03)` — estático
- Card central: `rgba(124, 58, 237, 0.08)`, border `1px solid rgba(124,58,237,0.3)`, border-radius 16px, padding 40px

### Animação
- Frame 90–110: card desliza de baixo (translateY +60px → 0, ease-out)
- Frame 110–170: 3 linhas de texto entram com fade + slide da esquerda, staggered 15f
- Frame 170–210: Badge "10x" pulsa com glow

### Texto
```
[dentro do card centralizado]
linha 1 · fade 110f: "Com IA. Ao vivo."
  font: sans-serif 2.4rem weight 800 color #ffffff

linha 2 · fade 125f: "Do zero ao deploy."
  font: sans-serif 2.4rem weight 800 color #00f2fe
  text-shadow: 0 0 20px rgba(0,242,254,0.4)

linha 3 · fade 140f: label monospace 0.8rem #9ca3af tracking 0.15em
  "100% HANDS-ON  ·  SEM CÓDIGO TRADICIONAL"

badge 170f: círculo 80px bg #7c3aed, texto "10x" weight 900 1.8rem branco
  position: canto superior-direito do card, translateY -40px
```

---

## Beat 3 — EVENTO · 7s–11s (frames 210–330)

### Transição
- Fade rápido (8 frames) de branco → #050816

### Visual
- Fundo: `#050816`
- Linha vertical esquerda: 3px solid gradient `#7c3aed → #00f2fe`, height 100%, animated draw top-to-bottom
- Glow ambient roxo amplo opacity 0.25 no centro

### Animação
- Frame 210–240: linha vertical esquerda desenha de cima pra baixo
- Frame 240–260: "AI EXPERIENCE" entra de cima com bounce suave
- Frame 260–280: "ESTÂNCIA VELHA" entra outline style (text-stroke)
- Frame 280–310: detalhes (data e local) fazem fade in
- Frame 310–330: micro-line separadora aparece sob o título

### Texto
```
[alinhado à esquerda, padding-left 60px, vertical center]

label: font monospace 0.75rem color #00f2fe tracking 0.3em uppercase
"[ 15 DE AGOSTO · 2026 ]"

título 1: sans-serif 4.5rem weight 900 color #ffffff
"AI"

título 1b: sans-serif 4.5rem weight 900 uppercase
color: transparent, WebkitTextStroke: "2px #7c3aed"
"EXPERIENCE"

título 2: sans-serif 3.8rem weight 900 color #ffffff
"ESTÂNCIA"

título 2b: sans-serif 3.8rem weight 900
color: transparent, WebkitTextStroke: "2px #00f2fe"
"VELHA"

sub: monospace 0.85rem color #9ca3af
"Auditório Müller · Estância Velha, RS"
```

---

## Beat 4 — CTA · 11s–15s (frames 330–450)

### Transição
- Hard cut com flash roxo de 3 frames

### Visual
- Fundo: gradient radial `#0d0621 → #050816`
- Particle burst: 20 pequenas partículas roxas/cyan disparando do centro (frames 330–360)
- Botão CTA centralizado com pulse animation

### Animação
- Frame 330–360: particles burst
- Frame 360–390: "VAGAS LIMITADAS." entra com scale 0.8 → 1 + glow intenso
- Frame 390–420: subtexto fade in
- Frame 420–450: botão CTA pulsa (scale 1 → 1.05 → 1, loop 2x)

### Texto
```
[centro total]

linha 1: sans-serif 3.6rem weight 900 uppercase color #ffffff
text-shadow: 0 0 40px rgba(124,58,237,0.8)
"VAGAS"

linha 2: sans-serif 3.6rem weight 900 uppercase
color: linear-gradient(135deg, #7c3aed, #ec4899)
"LIMITADAS."

sub: monospace 0.9rem color #9ca3af tracking 0.1em margin-top 20px
"Apenas por convite nominal."

botão: bg linear-gradient(135deg, #7c3aed, #00f2fe)
border-radius 50px, padding 18px 40px
text: sans-serif 1.1rem weight 700 color #fff uppercase
"GARANTIR MINHA VAGA →"
box-shadow: 0 8px 30px rgba(124,58,237,0.5)
```

---

## Asset Audit

| Asset              | Tipo    | Usado em | Disponível |
|--------------------|---------|----------|------------|
| Texto dinâmico     | Text    | All      | ✅ gerado   |
| Glow/ambient       | Shape   | B1,B3,B4 | ✅ CSS/SVG  |
| Grid técnico       | SVG     | B2       | ✅ gerado   |
| Linha vertical     | Shape   | B3       | ✅ gerado   |
| Partículas burst   | Canvas  | B4       | ✅ gerado   |
| thiago_diaz.png    | Image   | —        | ⚠️ não usado (15s curto) |
| tech_map.png       | Image   | —        | ⚠️ não usado (15s curto) |
