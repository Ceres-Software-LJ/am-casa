/* ============================================================
   AM CASA — MOTOR DE ANIMAÇÕES
   ------------------------------------------------------------
   ONDE ENTRA: carregado DEPOIS de script.js, no fim do <body>:
       <script src="script.js" defer></script>
       <script src="animations.js" defer></script>

   Módulo independente de script.js (que cuida de ícones, header,
   carrossel e botão flutuante). Remover este arquivo desativa as
   animações sem quebrar nenhuma funcionalidade.

   COMO ADAPTAR A OUTRO LAYOUT
   Só o objeto SELETORES abaixo precisa mudar. Ele traduz os
   "papéis" da animação para as classes do projeto. À esquerda os
   nomes genéricos do briefing, à direita os equivalentes reais
   desta página — os dois funcionam.

   PERFORMANCE
   - Um único IntersectionObserver para todas as entradas.
   - Só transform e opacity são animados (compostos na GPU).
   - pointermove do tilt limitado por requestAnimationFrame.
   - Cada elemento é observado uma vez e depois liberado.
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     CONFIGURAÇÃO — mapa de classes
     ========================================================== */
  var SELETORES = {
    // Barra de navegação fixa
    nav: ".site-header",

    // Seção do hero (recebe a classe .hero--loaded)
    hero: ".hero",

    // Títulos que ganham a onda por palavra
    titulos: ".section-title",

    // Fade-up simples via IntersectionObserver
    fades: ".eyebrow, .section-sub, .section__lead, .reveal, .step, .feature",

    // Mídia com cortina saindo para a direita
    mascaras: ".browser-mock",

    // Fotos com cortina subindo (equipe)
    cortinasVerticais: ".member-card__photo, .member__media",

    // Cards com entrada escalonada
    cards: ".card, .product, .testimonial, .member, .trust__item",

    // Cards que ganham tilt 3D no hover
    tilt: ".card, .product, .testimonial, .member",

    // Botões com efeito ripple
    ripple: ".btnRipple, .btn",

    // Pilha de fotos que alterna e abre em leque
    leque: "[data-photo-fan]",

    // Trilho contínuo de depoimentos
    marquee: "[data-marquee]",

    // Vídeos de fundo do hero
    videoHero: ".hero__video",

    // Grade filtrável (equipe)
    filtravel: "[data-filtravel]"
  };

  var CONFIG = {
    navShrinkApos: 80,   // px de rolagem para encolher a navbar
    tiltMax: 5,           // graus máximos de rotação
    tiltPerspectiva: 700, // px de perspectiva
    lequeIntervalo: 4000, // ms entre a troca automática das fotos
    marqueeVelocidade: 45, // px por segundo do trilho de depoimentos
    videoDesktopAcima: "(min-width: 48em)" // acima disso, vídeo 16:9
  };

  /* ==========================================================
     UTILITÁRIOS
     ========================================================== */
  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temPonteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function buscarTodos(seletor, contexto) {
    return Array.prototype.slice.call((contexto || document).querySelectorAll(seletor));
  }

  /* Marca o elemento como "já tratado" para não receber dois
     tipos de animação (ex.: um .card que também tem .reveal). */
  function jaTratado(el) {
    return el.hasAttribute("data-anim") || el.hasAttribute("data-hero-step");
  }

  /* ==========================================================
     FASE 2 — HERO: ENTRADA ESCALONADA
     Os atrasos de cada passo estão no CSS (bloco 02).
     Aqui só disparamos a sequência.
     ========================================================== */
  function iniciarHero() {
    var hero = document.querySelector(SELETORES.hero);
    if (!hero) return;
    hero.classList.add("hero--loaded");
  }

  /* ==========================================================
     FASE 3.1 — TÍTULOS: QUEBRA POR PALAVRA
     Cada palavra vira <span class="w" style="--wi: N">.
     O texto continua idêntico para leitores de tela.
     ========================================================== */
  function prepararTitulos() {
    if (semMovimento) return; // sem movimento não há por que fatiar o DOM

    buscarTodos(SELETORES.titulos).forEach(function (titulo) {
      if (titulo.dataset.split === "true") return;

      var texto = titulo.textContent.trim();
      if (!texto) return;

      var palavras = texto.split(/\s+/);
      var fragmento = document.createDocumentFragment();

      palavras.forEach(function (palavra, i) {
        var span = document.createElement("span");
        span.className = "w";
        span.style.setProperty("--wi", i);
        span.textContent = palavra;
        fragmento.appendChild(span);

        // espaço real entre as palavras (mantém a quebra de linha natural)
        if (i < palavras.length - 1) {
          fragmento.appendChild(document.createTextNode(" "));
        }
      });

      titulo.textContent = "";
      titulo.appendChild(fragmento);
      titulo.dataset.split = "true";
    });
  }

  /* ==========================================================
     FASE 3.2 — MARCAÇÃO DOS ELEMENTOS ANIMÁVEIS
     Define quem recebe qual tipo de entrada, na ordem de
     prioridade: cards > cortinas > fades.
     ========================================================== */
  function marcarElementos() {
    // Cards: stagger dentro do próprio grupo (mesmo elemento-pai)
    var gruposVistos = new Map();

    buscarTodos(SELETORES.cards).forEach(function (card) {
      if (jaTratado(card)) return;

      var pai = card.parentNode;
      var indice = gruposVistos.get(pai) || 0;
      gruposVistos.set(pai, indice + 1);

      card.setAttribute("data-anim", "card");
      card.style.setProperty("--ci", indice);
    });

    // Fades genéricos: tudo que sobrou
    buscarTodos(SELETORES.fades).forEach(function (el) {
      if (jaTratado(el)) return;
      // .eyebrow / .section-sub já têm estado inicial próprio no CSS
      if (!el.classList.contains("eyebrow") &&
          !el.classList.contains("section-sub") &&
          !el.classList.contains("section__lead")) {
        el.setAttribute("data-anim", "fade");
      }
    });

    // Cortinas verticais precisam da classe canônica para o CSS
    buscarTodos(SELETORES.cortinasVerticais).forEach(function (el) {
      el.classList.add("member-card__photo");
    });
  }

  /* ==========================================================
     FASE 3.3 — OBSERVER ÚNICO DE ENTRADA
     Um só IntersectionObserver cuida de títulos, fades, cards,
     máscaras e cortinas. Cada alvo é liberado após disparar.
     ========================================================== */
  function iniciarObserver() {
    var alvos = []
      .concat(buscarTodos(SELETORES.titulos))
      .concat(buscarTodos(".eyebrow, .section-sub, .section__lead"))
      .concat(buscarTodos('[data-anim="fade"], [data-anim="card"]'))
      .concat(buscarTodos(SELETORES.mascaras))
      .concat(buscarTodos(".member-card__photo"));

    // Elementos do hero são regidos pela sequência de entrada
    alvos = alvos.filter(function (el) {
      return !el.hasAttribute("data-hero-step");
    });

    if (!alvos.length) return;

    function ativar(el) {
      if (el.matches(SELETORES.mascaras) || el.classList.contains("member-card__photo")) {
        el.classList.add("mask-off");
      } else {
        el.classList.add("in");
      }
    }

    // Sem observer ou sem movimento: mostra tudo de uma vez
    if (!("IntersectionObserver" in window) || semMovimento) {
      alvos.forEach(ativar);
      return;
    }

    var observer = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          // Ativa ao entrar na tela OU se o elemento já ficou para trás
          // (rolagem muito rápida pode pular a interseção).
          if (!entrada.isIntersecting && entrada.boundingClientRect.top > 0) return;
          ativar(entrada.target);
          observer.unobserve(entrada.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    );

    alvos.forEach(function (el) { observer.observe(el); });

    /* Rede de segurança: um "fling" no celular pode atravessar a tela
       entre dois frames e o observer não chega a reportar o elemento.
       Depois que a rolagem para, tudo que já passou do topo da tela é
       revelado. Sem isso, um trecho poderia ficar invisível para sempre. */
    var varredura = null;

    function varrerPendentes() {
      var altura = window.innerHeight;
      alvos = alvos.filter(function (el) {
        if (el.getBoundingClientRect().top > altura) return true; // ainda abaixo
        ativar(el);
        observer.unobserve(el);
        return false;
      });

      if (!alvos.length) {
        window.removeEventListener("scroll", aoRolar);
      }
    }

    function aoRolar() {
      window.clearTimeout(varredura);
      varredura = window.setTimeout(varrerPendentes, 220);
    }

    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* ==========================================================
     FASE 3.4 — LIMPEZA PÓS-ANIMAÇÃO
     Sem isso, o animation-fill-mode: both congelaria o transform
     do card e o tilt/hover não funcionaria depois da entrada.
     ========================================================== */
  function iniciarLimpeza() {
    document.addEventListener(
      "animationend",
      function (evento) {
        var nome = evento.animationName;
        if (nome !== "animFadeUp" && nome !== "animFadeUpScale" &&
            nome !== "animTitleIn" && nome !== "animWordUp") return;

        evento.target.classList.add("anim-done");
      },
      true
    );
  }

  /* ==========================================================
     FASE 3.5 — TILT 3D NOS CARDS
     Só com mouse (pointer: fine) e com movimento permitido.
     O cálculo roda dentro de requestAnimationFrame: no máximo
     uma escrita de estilo por frame.
     ========================================================== */
  function iniciarTilt() {
    if (semMovimento || !temPonteiroFino) return;

    buscarTodos(SELETORES.tilt).forEach(function (card) {
      card.setAttribute("data-tilt", "");

      var frame = null;
      var ultimoEvento = null;

      function aplicar() {
        frame = null;
        if (!ultimoEvento) return;

        var caixa = card.getBoundingClientRect();
        // -0.5 a 0.5 em cada eixo, a partir do centro do card
        var px = (ultimoEvento.clientX - caixa.left) / caixa.width - 0.5;
        var py = (ultimoEvento.clientY - caixa.top) / caixa.height - 0.5;

        var rotY = px * CONFIG.tiltMax * 2;
        var rotX = -py * CONFIG.tiltMax * 2;

        card.style.transform =
          "perspective(" + CONFIG.tiltPerspectiva + "px)" +
          " rotateX(" + rotX.toFixed(2) + "deg)" +
          " rotateY(" + rotY.toFixed(2) + "deg)" +
          " translateY(-4px)";

        // A sombra acompanha a inclinação: quanto mais inclinado,
        // mais deslocada e mais profunda.
        card.style.boxShadow =
          (-rotY * 0.9).toFixed(1) + "px " +
          (rotX * 0.9 + 18).toFixed(1) + "px 42px rgba(26, 26, 26, 0.13)";
      }

      card.addEventListener("pointerenter", function (evento) {
        if (evento.pointerType !== "mouse") return;
        card.classList.add("is-tilting");
      });

      card.addEventListener("pointermove", function (evento) {
        if (evento.pointerType !== "mouse") return;
        ultimoEvento = evento;
        if (frame === null) frame = window.requestAnimationFrame(aplicar);
      });

      card.addEventListener("pointerleave", function () {
        if (frame !== null) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
        ultimoEvento = null;
        card.classList.remove("is-tilting");
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });
  }

  /* ==========================================================
     FASE 3.6 — RIPPLE DE CLIQUE
     O círculo nasce na coordenada do clique e cresce até cobrir
     o botão, sumindo. Um único listener delegado no documento.
     ========================================================== */
  function iniciarRipple() {
    if (semMovimento) return;

    document.addEventListener("pointerdown", function (evento) {
      var alvo = evento.target.closest(SELETORES.ripple);
      if (!alvo) return;

      alvo.classList.add("btnRipple");

      var caixa = alvo.getBoundingClientRect();
      var x = evento.clientX - caixa.left;
      var y = evento.clientY - caixa.top;

      // Diâmetro = duas vezes a maior distância até um canto,
      // garantindo que o círculo cubra o botão inteiro.
      var maiorDistancia = Math.max(
        Math.hypot(x, y),
        Math.hypot(caixa.width - x, y),
        Math.hypot(x, caixa.height - y),
        Math.hypot(caixa.width - x, caixa.height - y)
      );
      var tamanho = maiorDistancia * 2;

      var onda = document.createElement("span");
      onda.className = "ripple";
      onda.style.width = onda.style.height = tamanho + "px";
      onda.style.left = (x - maiorDistancia) + "px";
      onda.style.top = (y - maiorDistancia) + "px";

      onda.addEventListener("animationend", function () {
        if (onda.parentNode) onda.parentNode.removeChild(onda);
      });

      alvo.appendChild(onda);
    }, { passive: true });
  }

  /* ==========================================================
     FASE 3.7 — NAVBAR: SHRINK NA ROLAGEM
     Encolhe passando de 80px do topo. Listener passivo e
     limitado por requestAnimationFrame.
     ========================================================== */
  function iniciarNavbar() {
    var nav = document.querySelector(SELETORES.nav);
    if (!nav) return;

    var agendado = false;

    function atualizar() {
      agendado = false;
      nav.classList.toggle("nav--shrink", window.pageYOffset > CONFIG.navShrinkApos);
    }

    window.addEventListener("scroll", function () {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(atualizar);
    }, { passive: true });

    atualizar();
  }

  /* ==========================================================
     FASE 3.8 — LEQUE DE FOTOS (seção Sobre)

     Fechado: as fotos ficam empilhadas e trocam sozinhas a cada 4s.
     Aberto:  abrem em leque. Clicar numa foto de trás traz ela para
              a frente; clicar na da frente (ou no botão) fecha.

     A variável --fi guarda a posição de cada foto na pilha: 0 é a
     da frente. Quem desenha a posição é o CSS.
     ========================================================== */
  function iniciarLeque() {
    buscarTodos(SELETORES.leque).forEach(function (leque) {
      var fotos = buscarTodos(".photo-fan__item", leque);
      if (fotos.length < 2) return;

      var botao = leque.querySelector(".photo-fan__toggle");
      var rotulo = leque.querySelector(".photo-fan__label");
      var pilha = leque.querySelector(".photo-fan__stack");
      var aberto = false;
      var timer = null;

      function aplicarOrdem() {
        fotos.forEach(function (foto, i) {
          foto.style.setProperty("--fi", i);
          foto.classList.toggle("is-front", i === 0);

          if (aberto) {
            // Abertas, as fotos viram alvos de clique de verdade
            foto.setAttribute("role", "button");
            foto.setAttribute("tabindex", "0");
            foto.setAttribute("aria-hidden", "false");
            foto.setAttribute("aria-label", i === 0
              ? "Foto " + (i + 1) + " de " + fotos.length + ". Fechar o leque."
              : "Ver a foto " + (i + 1) + " de " + fotos.length);
          } else {
            foto.removeAttribute("role");
            foto.removeAttribute("tabindex");
            foto.removeAttribute("aria-label");
            // Empilhadas, só a da frente é anunciada
            foto.setAttribute("aria-hidden", i > 0 ? "true" : "false");
          }
        });
      }

      /* Move a foto da posição `pos` para a frente, mantendo a
         ordem circular das outras. */
      function trazerParaFrente(pos) {
        if (pos <= 0) return;
        fotos = fotos.slice(pos).concat(fotos.slice(0, pos));
        aplicarOrdem();
      }

      function girar() {
        trazerParaFrente(1);
      }

      function pararCiclo() {
        if (timer === null) return;
        window.clearInterval(timer);
        timer = null;
      }

      function iniciarCiclo() {
        if (semMovimento || aberto || timer !== null) return;
        timer = window.setInterval(girar, CONFIG.lequeIntervalo);
      }

      function alternar(forcar) {
        aberto = (typeof forcar === "boolean") ? forcar : !aberto;
        leque.classList.toggle("is-open", aberto);

        if (botao) botao.setAttribute("aria-expanded", aberto ? "true" : "false");
        if (rotulo) rotulo.textContent = aberto ? "Fechar" : "Ver as fotos";

        aplicarOrdem();
        if (aberto) { pararCiclo(); } else { iniciarCiclo(); }
      }

      /* Um clique na pilha faz coisas diferentes conforme o estado */
      function aoClicarNaPilha(evento) {
        var foto = evento.target.closest(".photo-fan__item");

        if (!aberto) { alternar(true); return; }   // fechado: abre
        if (!foto)   { alternar(false); return; }  // clicou fora das fotos: fecha

        var pos = fotos.indexOf(foto);
        if (pos === 0) { alternar(false); return; } // já está na frente: fecha
        trazerParaFrente(pos);                      // traz para a frente
      }

      aplicarOrdem();

      if (pilha) {
        pilha.addEventListener("click", aoClicarNaPilha);

        // Mesmo comportamento pelo teclado
        pilha.addEventListener("keydown", function (evento) {
          if (evento.key !== "Enter" && evento.key !== " ") return;
          if (!evento.target.closest(".photo-fan__item")) return;
          evento.preventDefault();
          aoClicarNaPilha(evento);
        });
      }

      if (botao) botao.addEventListener("click", function () { alternar(); });

      // Enquanto o ponteiro está sobre as fotos, a troca automática pausa
      leque.addEventListener("pointerenter", pararCiclo);
      leque.addEventListener("pointerleave", function () {
        if (!aberto) iniciarCiclo();
      });

      iniciarCiclo();
    });
  }

  /* ==========================================================
     FASE 3.9 — TRILHO CONTÍNUO DE DEPOIMENTOS (marquee)
     Duplica os cards para o loop não ter emenda e calcula o
     deslocamento exato de uma cópia (incluindo o gap), para a
     volta ser invisível. A duração vem da largura, então a
     velocidade é a mesma em qualquer tela.
     ========================================================== */
  function iniciarMarquee() {
    buscarTodos(SELETORES.marquee).forEach(function (marquee) {
      var trilho = marquee.querySelector(".marquee__track");
      if (!trilho) return;

      var originais = Array.prototype.slice.call(trilho.children);
      if (!originais.length) return;

      // Sem movimento: vira uma lista de rolagem manual
      if (semMovimento) {
        marquee.classList.add("marquee--estatico");
        return;
      }

      /* Os cards do trilho não usam a entrada escalonada: eles já
         entram em cena deslizando. Sem isso, as cópias nasceriam com
         opacity: 0 (data-anim="card") e nunca seriam observadas. */
      originais.forEach(function (item) {
        item.removeAttribute("data-anim");
        item.classList.remove("in");
        item.classList.add("anim-done");
      });

      // Cópia decorativa: escondida para leitores de tela e
      // fora da ordem de tabulação.
      originais.forEach(function (item) {
        var copia = item.cloneNode(true);
        copia.setAttribute("aria-hidden", "true");
        buscarTodos("a, button", copia).forEach(function (foco) {
          foco.setAttribute("tabindex", "-1");
        });
        trilho.appendChild(copia);
      });

      function medir() {
        var gap = parseFloat(window.getComputedStyle(trilho).columnGap) || 0;
        // Uma cópia + o gap que a separa da seguinte
        var deslocamento = (trilho.scrollWidth + gap) / 2;

        trilho.style.setProperty("--marquee-shift", deslocamento.toFixed(2) + "px");
        trilho.style.setProperty(
          "--marquee-dur",
          (deslocamento / CONFIG.marqueeVelocidade).toFixed(2) + "s"
        );
      }

      medir();
      marquee.classList.add("marquee--ativo");

      // Recalcula quando a largura muda (rotação de tela, resize)
      var reagendar = null;
      window.addEventListener("resize", function () {
        window.clearTimeout(reagendar);
        reagendar = window.setTimeout(medir, 200);
      }, { passive: true });
    });
  }

  /* ==========================================================
     FASE 3.10 — VÍDEO DE FUNDO DO HERO

     Regras que este bloco garante:
     - Movimento reduzido  -> nenhum autoplay, fica só o poster.
     - Conexão lenta / economia de dados -> idem, o vídeo é um
       aprimoramento e nunca pode segurar a primeira tela.
     - Só o vídeo da orientação em uso é baixado; o outro tem as
       fontes removidas (e volta a ter se a tela mudar de tamanho).
     - O vídeo só aparece quando realmente começa a tocar, então
       um arquivo ausente ou uma rede ruim deixam o poster no lugar,
       sem tela preta e sem quebrar o layout.
     ========================================================== */
  function iniciarVideoHero() {
    var videos = buscarTodos(SELETORES.videoHero);
    if (!videos.length) return;

    var hero = document.querySelector(SELETORES.hero);

    /* Conexão fraca ou "economia de dados" ligada no celular */
    var conexao = navigator.connection || navigator.mozConnection ||
                  navigator.webkitConnection;
    var redeFraca = !!(conexao && (conexao.saveData === true ||
                     /(^|-)2g$/.test(conexao.effectiveType || "")));

    function descarregar(video) {
      video.classList.remove("is-playing");
      video.removeAttribute("autoplay");
      try { video.pause(); } catch (erro) { /* ignora */ }

      // Guarda o caminho e tira o src: o navegador para de baixar
      buscarTodos("source", video).forEach(function (fonte) {
        var atual = fonte.getAttribute("src");
        if (atual) {
          fonte.dataset.src = atual;
          fonte.removeAttribute("src");
        }
      });

      video.preload = "none";
      try { video.load(); } catch (erro) { /* ignora */ }
    }

    function ativar(video) {
      buscarTodos("source", video).forEach(function (fonte) {
        if (!fonte.getAttribute("src") && fonte.dataset.src) {
          fonte.setAttribute("src", fonte.dataset.src);
        }
      });

      video.preload = "metadata";
      try { video.load(); } catch (erro) { /* ignora */ }

      var promessa = video.play();
      if (promessa && promessa.catch) {
        // Autoplay bloqueado pelo navegador: o poster continua valendo
        promessa.catch(function () {
          video.classList.remove("is-playing");
        });
      }
    }

    /* Sem movimento ou sem banda: nem começa */
    if (semMovimento || redeFraca) {
      if (hero) hero.classList.add("hero--sem-video");
      videos.forEach(descarregar);
      return;
    }

    videos.forEach(function (video) {
      video.addEventListener("playing", function () {
        video.classList.add("is-playing");
      });
      // Arquivo ausente ou erro de rede: fica o poster
      video.addEventListener("error", function () {
        video.classList.remove("is-playing");
      }, true);
    });

    var telaGrande = window.matchMedia(CONFIG.videoDesktopAcima);

    function aplicarOrientacao() {
      videos.forEach(function (video) {
        var ehDoDesktop = video.classList.contains("hero__video--desktop");
        if (ehDoDesktop === telaGrande.matches) {
          ativar(video);
        } else {
          descarregar(video);
        }
      });
    }

    aplicarOrientacao();

    // Girar o celular ou redimensionar troca o vídeo em uso
    if (telaGrande.addEventListener) {
      telaGrande.addEventListener("change", aplicarOrientacao);
    } else if (telaGrande.addListener) {
      telaGrande.addListener(aplicarOrientacao);
    }
  }

  /* ==========================================================
     FASE 3.11 — GRADE FILTRÁVEL (equipe)

     Cada card traz data-especialidades="cortes penteados" e cada
     botão traz data-filtro="cortes". Não há lista fixa no código:
     acrescentar um botão e usar a palavra nos cards já funciona.

     Os cards escondidos saem do fluxo (display: none), então a
     grade se reorganiza sem buracos. Os que aparecem recebem uma
     entrada curta e escalonada.
     ========================================================== */
  function iniciarFiltros() {
    buscarTodos(SELETORES.filtravel).forEach(function (grade) {
      var secao = grade.closest("section") || document;
      var botoes = buscarTodos("[data-filtro]", secao);
      var cards = buscarTodos(":scope > *", grade);
      var aviso = secao.querySelector("[data-filtro-status]");
      var vazio = secao.querySelector("[data-filtro-vazio]");
      if (!botoes.length || !cards.length) return;

      function aplicar(filtro) {
        var visiveis = 0;

        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-especialidades") || "").split(/\s+/);
          var combina = filtro === "todas" || tags.indexOf(filtro) !== -1;

          card.classList.toggle("is-oculto", !combina);

          if (!combina) return;

          /* Garante que o card apareça mesmo que o observer de
             entrada nunca o tenha visto (ele estava display:none). */
          card.classList.add("in", "anim-done");
          card.style.setProperty("--ci", visiveis);
          visiveis++;

          if (semMovimento) return;
          // reinicia a animação de entrada para o card que reaparece
          card.style.animation = "none";
          void card.offsetWidth;          // força o reflow
          card.style.animation = "";
        });

        if (vazio) vazio.hidden = visiveis > 0;

        if (aviso) {
          aviso.textContent = visiveis === 1
            ? "1 profissional encontrada."
            : visiveis + " profissionais encontradas.";
        }
      }

      botoes.forEach(function (botao) {
        botao.addEventListener("click", function () {
          botoes.forEach(function (outro) {
            var ativo = outro === botao;
            outro.classList.toggle("is-active", ativo);
            outro.setAttribute("aria-pressed", ativo ? "true" : "false");
          });
          aplicar(botao.getAttribute("data-filtro"));
        });
      });
    });
  }

  /* ==========================================================
     INICIALIZAÇÃO
     ========================================================== */
  function iniciar() {
    prepararTitulos();
    marcarElementos();
    iniciarLimpeza();
    iniciarObserver();
    iniciarTilt();
    iniciarRipple();
    iniciarNavbar();
    iniciarVideoHero();
    iniciarFiltros();
    iniciarLeque();
    iniciarMarquee();   // depois de marcarElementos/iniciarObserver
    iniciarHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
