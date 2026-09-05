# AM Casa — Landing Page

Landing page de conversão por WhatsApp para a **AM Casa (Ana Mesquita Casa)**, espaço de
beleza e venda de produtos para cabelo em Campo Grande, MS.

HTML, CSS e JavaScript puros. Sem build, sem dependências para instalar.
Para ver o site, basta abrir o arquivo `index.html` no navegador.

---

## Estrutura de arquivos

```
AM CASA/
├── index.html        → todo o conteúdo e os textos da página
├── styles.css        → cores, fontes, espaçamentos e responsividade
├── script.js         → ícones, header e botão flutuante
├── animations.css    → todo o movimento da página (estilos)
├── animations.js     → todo o movimento da página (lógica)
├── README.md         → este arquivo
└── assets/
    ├── logo.jpg          → logo AM Casa (usada no header)
    ├── favicon.svg       → ícone da aba do navegador
    ├── hero-desktop.webm/.mp4   → vídeo do hero (16:9)
    ├── hero-mobile.webm/.mp4    → vídeo do hero (9:16)
    ├── hero-poster.jpg          → poster do vídeo
    ├── sobre-espaco.svg  → PLACEHOLDER da 1ª foto do leque
    ├── sobre-2.svg       → PLACEHOLDER da 2ª foto do leque
    ├── sobre-3.svg       → PLACEHOLDER da 3ª foto do leque
    ├── produto-1..4.svg  → PLACEHOLDERS das fotos de produtos
    └── equipe-1..3.svg   → PLACEHOLDERS das fotos da equipe
```

**Os dois arquivos `animations.*` são um módulo separado.** Se quiser a página
sem nenhuma animação, basta remover as duas linhas que os carregam no
`index.html` — nada quebra, o conteúdo continua todo visível.

> Os arquivos `.svg` cinza/areia são **imagens provisórias**. Troque todos por fotos reais
> antes de publicar.

---

## Como editar — tudo o que falta ajustar

Todos os pontos que precisam de informação real estão marcados no código com **`[AJUSTAR]`**.
Abra `index.html` em qualquer editor de texto (VS Code, Bloco de Notas) e use
**Ctrl + F → `[AJUSTAR]`** para percorrer um por um.

### 1. Endereço e horário (obrigatório)

Aparecem em 4 lugares. Busque por `[AJUSTAR` e substitua:

| Onde | O que trocar |
|---|---|
| Seção **Perguntas frequentes** | `[AJUSTAR: endereço]` e `[AJUSTAR: dias e horários]` |
| Seção **Localização e contato** | `[AJUSTAR: rua, número, bairro]` e os horários |
| **Rodapé** | `[AJUSTAR: rua, número, bairro]` |
| **JSON-LD** (no topo, dentro do `<head>`) | `streetAddress`, `postalCode` e os horários em `openingHoursSpecification` |

O JSON-LD é o bloco de dados que o Google lê para mostrar o negócio na busca e no Maps.
Vale a pena preencher com capricho.

### 2. Mapa do Google

Na seção **Localização e contato** há um `<iframe>` com um mapa genérico de Campo Grande.
Para colocar o endereço certo:

1. Abra o [Google Maps](https://maps.google.com) e busque o endereço da AM Casa.
2. Clique em **Compartilhar → Incorporar um mapa → Copiar HTML**.
3. Substitua o `<iframe>` inteiro pelo código copiado.
4. Mantenha os atributos `loading="lazy"` e `title="..."` no iframe colado.

No mesmo bloco, ajuste também o botão **"Traçar rota"**: troque
`AM+Casa+Campo+Grande+MS` no link pelo endereço real (espaços viram `+`).

### 3. Serviços

Os 5 serviços atuais são um ponto de partida. Cada um é um bloco `<article class="card">`
na seção **"O que fazemos por você"**. Em cada bloco você pode trocar:

- o **ícone**: atributo `data-lucide="scissors"` — veja os nomes disponíveis em
  [lucide.dev/icons](https://lucide.dev/icons);
- o **título** (`<h3>`) e o **texto** (`<p>`);
- o **nome do serviço no link do WhatsApp**, no final da URL
  (`...Tenho%20interesse%20em%3A%20Corte%20e%20finaliza%C3%A7%C3%A3o.`).

Para **adicionar** um serviço, copie um bloco `<article class="card"> ... </article>` inteiro
e cole logo abaixo. Para **remover**, apague o bloco.

> Ao trocar o nome do serviço no link, acentos precisam ser codificados
> (`ç` = `%C3%A7`, `ã` = `%C3%A3`, `á` = `%C3%A1`, espaço = `%20`).
> Um jeito fácil e sem erro: escreva a mensagem no WhatsApp Web, copie o link gerado, ou use
> qualquer site de "URL encoder".

Se mudar os serviços, atualize também a lista `hasOfferCatalog` no JSON-LD do `<head>`.

### 4. Fotos

Troque os arquivos da pasta `assets/` mantendo o **mesmo nome**, ou altere o `src` no HTML.

| Arquivo | Onde aparece | Formato ideal |
|---|---|---|
| `sobre-espaco.svg`, `sobre-2.svg`, `sobre-3.svg` | leque de fotos da seção "Sobre" | retrato, ~800×900px |
| `produto-1..4.svg` | vitrine de produtos | retrato, ~600×700px |
| `equipe-1..3.svg` | seção "Nossa equipe" | retrato, ~600×760px |

**Recomendado:** salve as fotos em **`.webp`** (arquivo bem menor, site mais rápido).
Se usar `.webp` ou `.jpg`, lembre de trocar a extensão no `src` do HTML também.
Sempre escreva um `alt` que descreva a foto — isso ajuda no Google e em leitores de tela.

### 5. Equipe (seção desativada)

A seção **"Nossa equipe"** já está pronta, mas **não aparece no site** porque ainda não há fotos.

Para ativar: em `index.html`, encontre a linha

```html
<section class="section equipe" id="equipe" hidden>
```

e **apague a palavra `hidden`**. Depois troque as fotos e os nomes/funções de cada pessoa.

### 6. Depoimentos — ⚠️ importante

Os 3 depoimentos atuais são **fictícios**, apenas para mostrar o layout.
**Substitua por depoimentos reais antes de publicar**, com o nome verdadeiro da cliente
(peça autorização) e a cidade. Estão na seção **"O que dizem sobre a AM Casa"**.

### 7. Domínio e imagem de compartilhamento

Depois de definir o domínio, no `<head>` troque `https://amcasa.com.br/` por ele em:
`<link rel="canonical">`, `og:url`, `og:image` e o campo `url` do JSON-LD.

Para o preview bonito ao compartilhar o link no WhatsApp e no Instagram, crie uma imagem
**1200×630px**, salve como `assets/og-image.jpg` e aponte a tag `og:image` para ela.

---

## Vídeo de fundo do hero

O topo da página usa um vídeo em loop atrás da copy. **Já está pronto e
funcionando** — os arquivos foram gerados a partir de
`Close_up_cinematic_shot_of_a_h.mp4`.

### Arquivos em `/assets`

| Arquivo | Formato | Tamanho |
|---|---|---|
| `hero-desktop.webm` | 1280×720 (16:9) | 1,2 MB |
| `hero-desktop.mp4` | 1280×720 (16:9) | 1,4 MB |
| `hero-mobile.webm` | 540×960 (9:16) | 0,65 MB |
| `hero-mobile.mp4` | 540×960 (9:16) | 0,86 MB |
| `hero-poster.jpg` | 1280×720 | 34 KB |

O celular baixa só a versão vertical (~0,65 MB) e o computador só a
horizontal (~1,2 MB) — nunca os dois.

### Para trocar o vídeo depois

Salve os novos arquivos com **exatamente esses nomes** e pronto, não precisa
mexer no código. Se quiser gerar as versões a partir de um vídeo novo, os
comandos usados foram (precisa ter o `ffmpeg` instalado):

```bash
# desktop 16:9
ffmpeg -i ORIGINAL.mp4 -an -c:v libx264 -preset slow -crf 27   -pix_fmt yuv420p -movflags +faststart assets/hero-desktop.mp4
ffmpeg -i ORIGINAL.mp4 -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1   assets/hero-desktop.webm

# mobile 9:16 (recorte central do mesmo vídeo)
ffmpeg -i ORIGINAL.mp4 -an -vf "crop=406:720:(iw-406)/2:0,scale=540:960"   -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart   assets/hero-mobile.mp4
ffmpeg -i ORIGINAL.mp4 -an -vf "crop=406:720:(iw-406)/2:0,scale=540:960"   -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 assets/hero-mobile.webm

# poster (quadro em 1,2s)
ffmpeg -ss 1.2 -i ORIGINAL.mp4 -frames:v 1 -q:v 4 assets/hero-poster.jpg
```

> Os `.mp4` originais que estão na **raiz** da pasta (`Close_up_...` e
> `Extreme_slow_motion_...`) são só as fontes. **Não precisa publicá-los** —
> só o conteúdo de `/assets` vai para o ar.

### O que já está resolvido no código

- **Nunca baixa os dois vídeos.** Só o da orientação em uso é carregado; o
  outro fica sem `src`. Girar o celular troca sozinho.
- **Movimento reduzido.** Quem liga "reduzir movimento" no sistema não recebe
  autoplay: fica só o poster.
- **Conexão lenta ou economia de dados.** Em 2G ou com "economia de dados"
  ligada, o vídeo nem começa.
- **Se o vídeo falhar**, o poster continua no lugar. Sem tela preta, sem
  layout quebrado — o vídeo só aparece quando começa a tocar de verdade.
- **O botão de agendar fica visível sem rolar**, no computador e no celular.

### Legibilidade do texto — foi medida, não estimada

Entre o vídeo e a copy existe um véu (`.hero__overlay`, `styles.css` bloco 08)
em off-white `#FAF8F5`, com gradiente: denso onde está o texto, leve onde o
vídeo aparece.

O contraste foi conferido **quadro a quadro nos 240 quadros do vídeo**,
compondo o véu sobre cada pixel e calculando o contraste WCAG:

| | Título | Texto de apoio |
|---|---|---|
| Desktop | 10,8:1 | 6,0:1 |
| Celular | 8,9:1 | 4,9:1 |
| Mínimo exigido (AA) | 3,0:1 | 4,5:1 |

Para isso, o texto de apoio **dentro do hero** usa um cinza mais fundo
(`--gray-deep: #4A443D`) em vez do `--gray` do resto do site. Sem isso, o véu
precisaria ser quase opaco e o vídeo praticamente sumiria — principalmente no
celular, onde o texto ocupa a tela toda.

> **Se você trocar o vídeo por um mais escuro ou mais agitado, refaça essa
> conta.** Um vídeo escuro derruba o contraste do texto grafite. O jeito
> rápido de compensar é aumentar as porcentagens do gradiente em
> `styles.css`, bloco 08.

---

## Componentes com movimento

### Cards flutuantes do hero

Três cartõezinhos sobre a foto do hero (`.float-card` no `index.html`).
São **decorativos** (`aria-hidden`), porque repetem o que a barra de selos logo
abaixo já diz em texto. Para editar, mude o ícone (`data-lucide`), o `<strong>`
e o `<em>` de cada um. Para ter menos, apague o bloco inteiro.
As posições ficam em `animations.css`, blocos 12 e 15.

### Leque de fotos (seção Sobre)

As fotos ficam empilhadas, **trocam sozinhas a cada 4 segundos** e **abrem em
leque quando alguém clica** (ou aperta Enter no botão "Ver as fotos").

- Para trocar as fotos: substitua `assets/sobre-espaco.svg`, `sobre-2.svg` e
  `sobre-3.svg`.
- Para ter mais ou menos fotos: acrescente ou remova blocos
  `<li class="photo-fan__item">` — o código se ajusta sozinho.
- Para mudar o tempo da troca: `lequeIntervalo` em `animations.js` (em ms).

### Carrossel contínuo de depoimentos

O trilho desliza sozinho da esquerda para a direita, sem emenda, e **pausa
quando o mouse entra** ou quando algo dentro dele recebe foco pelo teclado.

Você edita **apenas os 3 depoimentos** do `index.html`: o `animations.js`
duplica os cards automaticamente para o loop não ter costura, e calcula a
duração pela largura — assim a velocidade fica igual em qualquer tela.
Para deixar mais rápido ou mais lento, mude `marqueeVelocidade` (px por
segundo) em `animations.js`.

### Micro-interações

| Efeito | Onde | Como ajustar |
|---|---|---|
| Navbar encolhe ao rolar | depois de 80px | `navShrinkApos` (animations.js) |
| Entrada do hero em cascata | badge → título → texto → botões → legenda | atrasos no bloco 02 do animations.css |
| Título aparece palavra por palavra | todos os `h2` | `--anim-word-step` (70ms por palavra) |
| Cortina revelando as fotos | hero, produtos, equipe | blocos 05 e 06 do animations.css |
| Inclinação 3D nos cards | só com mouse | `tiltMax` e `tiltPerspectiva` |
| Brilho pulsante nos botões | a cada 4s, para no hover | bloco 08 do animations.css |
| Ondinha ao clicar (ripple) | todos os botões | bloco 09 do animations.css |

**Acessibilidade:** quem liga "reduzir movimento" no sistema (Windows, iPhone,
Android) recebe a página inteira sem nenhuma animação — o conteúdo aparece
direto, no lugar. Isso é automático.

**Para adaptar esse sistema a outro site:** no topo do `animations.js` há um
objeto `SELETORES` que traduz cada efeito para as classes do projeto. Trocando
as classes ali, o mesmo motor funciona em qualquer layout.

---

## Onde mudar o visual

Todas as cores e tamanhos estão no topo do `styles.css`, no bloco `:root`.
Mudar um valor ali reflete na página inteira:

```css
--off-white:  #FAF8F5;   /* fundo principal */
--sand:       #EFE9E1;   /* seções alternadas */
--nude:       #D9CFC4;   /* bordas finas */
--graphite:   #1A1A1A;   /* textos e botões */
--gray:       #6E665D;   /* textos de apoio */
--terracotta: #C08A6E;   /* acento: hover, detalhes */
--whatsapp:   #25D366;   /* só o botão flutuante */
```

O resto do arquivo é dividido por seção, com comentários numerados
(`08. HERO`, `11. SERVIÇOS`, etc.) para você achar rápido o que quer mexer.

---

## Trocar o número de WhatsApp

O número aparece em **14 links** no HTML, sempre no formato
`https://wa.me/5567981283113?text=...`.

Para trocar, use **Localizar e substituir** (Ctrl + H) no `index.html`:
procure por `5567981283113` e substitua pelo novo número no formato
`55` + DDD + número, sem espaços, parênteses ou traços.

Troque também o telefone exibido na seção de contato e no rodapé — `(67) 98128-3113` —
e o campo `telephone` no JSON-LD.

---

## Como publicar

O projeto já está no GitHub e configurado para a Vercel:

**Repositório:** https://github.com/Ceres-Software-LJ/am-casa

### Primeira publicação na Vercel

1. Entre em [vercel.com/new](https://vercel.com/new) e escolha **Import Git Repository**.
2. Selecione `Ceres-Software-LJ/am-casa`.
3. Não mude nada nas configurações — o `vercel.json` já cuida de tudo:
   - Framework Preset: **Other**
   - Build Command: vazio
   - Output Directory: vazio
4. Clique em **Deploy**. Em menos de um minuto o site está no ar.

### Publicar uma alteração

Depois de conectado, é só enviar para o GitHub que a Vercel publica sozinha:

```bash
git add .
git commit -m "troca as fotos da equipe"
git push
```

### Domínio próprio

No painel da Vercel: **Settings → Domains → Add**. Aponte o DNS conforme as
instruções que aparecem lá. O certificado HTTPS é gerado automaticamente.

Depois de apontar o domínio, lembre de trocá-lo no `<head>` do `index.html`
(`canonical`, `og:url`, `og:image` e o `url` do JSON-LD) e de descomentar a
linha `Sitemap:` do `robots.txt`.

### O que o `vercel.json` já faz

- Cache de 7 dias em `/assets` (imagens e vídeos) e nenhum cache no HTML, para
  uma alteração de texto aparecer na hora.
- Cabeçalhos de segurança básicos.
- URLs limpas (`/` em vez de `/index.html`).

> **Trocou uma foto e não apareceu?** É o cache de 7 dias. Ou espere, ou
> renomeie o arquivo (ex.: `equipe-1-v2.webp`) e atualize o `src` no HTML —
> renomear é o jeito garantido.

## Checklist antes de publicar

- [ ] Endereço e horário reais preenchidos (4 lugares + JSON-LD)
- [ ] Mapa do Google com o endereço correto
- [ ] Botão "Traçar rota" apontando para o endereço certo
- [ ] Serviços revisados e com os links de WhatsApp corretos
- [ ] Fotos reais no lugar dos placeholders (`.webp` de preferência)
- [ ] Se trocar o vídeo do hero, reconferir o contraste do texto
- [ ] Depoimentos reais no lugar dos fictícios
- [ ] As 3 fotos do leque da seção "Sobre" trocadas por reais
- [ ] Textos dos cards flutuantes do hero conferidos
- [ ] Seção Equipe ativada (ou mantida desativada de propósito)
- [ ] Domínio atualizado nas tags do `<head>`
- [ ] Imagem `og-image.jpg` (1200×630) criada
- [ ] Todos os botões de WhatsApp testados no celular
- [ ] Sem nenhum `[AJUSTAR]` sobrando: busque no `index.html` para conferir

---

## Detalhes técnicos

- **Fontes:** Cormorant Garamond (títulos) e Inter (textos), via Google Fonts.
- **Ícones:** [Lucide](https://lucide.dev) via CDN. WhatsApp e Instagram são SVGs
  embutidos no início do `<body>`, porque o Lucide não distribui ícones de marcas.
- **Acessibilidade:** `lang="pt-BR"`, link "pular para o conteúdo", `aria-label` em todos os
  botões, `alt` em todas as imagens, alvos de toque de no mínimo 48px e contraste adequado.
- **Movimento:** as animações de entrada respeitam a preferência
  "reduzir movimento" do sistema operacional.
- **Sem JavaScript:** se o script não carregar, todo o conteúdo continua visível e os
  links de WhatsApp continuam funcionando.
- **Formulários:** nenhum. Toda a conversão acontece pelo WhatsApp, por opção de projeto.
