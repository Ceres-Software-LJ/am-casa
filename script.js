/* ============================================================
   AM CASA — script.js
   Sem dependências além do Lucide (ícones).
   Blocos:
     01. Ícones (Lucide)
     02. Header: sombra e esconder/mostrar na rolagem
     03. Menu do celular (hambúrguer)
     (o fade-in ao rolar vive em animations.js)
     04. Botão flutuante de WhatsApp
     06. Ano no rodapé
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     01. ÍCONES (LUCIDE)
     Renderiza todos os elementos com [data-lucide].
     ========================================================== */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================
     02. HEADER
     - Ganha uma linha sutil quando a página sai do topo.
     - Esconde ao rolar para baixo e reaparece ao rolar para cima.
     ========================================================== */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var lastY = window.pageYOffset;
    var ticking = false;
    var HIDE_AFTER = 200; // só começa a esconder depois desta altura (px)
    var DELTA = 6;        // ignora micro-variações de rolagem

    function update() {
      var y = window.pageYOffset;

      header.classList.toggle("is-scrolled", y > 8);

      if (Math.abs(y - lastY) > DELTA) {
        var isScrollingDown = y > lastY;
        var menuAberto = header.classList.contains("menu-aberto");
        header.classList.toggle(
          "is-hidden",
          isScrollingDown && y > HIDE_AFTER && !menuAberto
        );
        lastY = y;
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ==========================================================
     03. MENU DO CELULAR
     O painel desce da própria barra. Fecha ao escolher uma
     seção, ao clicar fora, com Esc, e ao voltar para o desktop.
     ========================================================== */
  function initMenu() {
    var botao = document.getElementById("botaoMenu");
    var menu = document.getElementById("menuPrincipal");
    var header = document.getElementById("siteHeader");
    if (!botao || !menu) return;

    function definir(aberto) {
      menu.classList.toggle("is-open", aberto);
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      // trava o esconde-esconde do header enquanto o menu está aberto
      if (header) header.classList.toggle("menu-aberto", aberto);
    }

    function estaAberto() {
      return botao.getAttribute("aria-expanded") === "true";
    }

    botao.addEventListener("click", function () {
      definir(!estaAberto());
    });

    // Escolheu uma seção: fecha e deixa a rolagem acontecer
    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) definir(false);
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && estaAberto()) {
        definir(false);
        botao.focus();
      }
    });

    document.addEventListener("click", function (evento) {
      if (!estaAberto()) return;
      if (evento.target.closest("#menuPrincipal")) return;
      if (evento.target.closest("#botaoMenu")) return;
      definir(false);
    });

    // Voltou para o desktop com o menu aberto: fecha para não
    // deixar o painel preso no meio da barra
    var telaGrande = window.matchMedia("(min-width: 64em)");
    function aoTrocarDeTela() { if (telaGrande.matches) definir(false); }

    if (telaGrande.addEventListener) {
      telaGrande.addEventListener("change", aoTrocarDeTela);
    } else if (telaGrande.addListener) {
      telaGrande.addListener(aoTrocarDeTela);
    }
  }

  /* ==========================================================
     04. BOTÃO FLUTUANTE DE WHATSAPP
     Aparece assim que o usuário rola além do hero.
     ========================================================== */
  function initWhatsappFloat() {
    var float = document.getElementById("whatsappFloat");
    var hero = document.getElementById("hero");
    if (!float) return;

    function show(visible) {
      float.classList.toggle("is-visible", visible);
    }

    if (hero && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          // Visível quando o hero já saiu (quase todo) da tela
          show(!entries[0].isIntersecting);
        },
        { threshold: 0.15 }
      );
      observer.observe(hero);
      return;
    }

    // Fallback por posição de rolagem
    window.addEventListener(
      "scroll",
      function () {
        show(window.pageYOffset > window.innerHeight * 0.7);
      },
      { passive: true }
    );
  }

  /* ==========================================================
     06. ANO NO RODAPÉ
     ========================================================== */
  function initYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================
     INICIALIZAÇÃO
     ========================================================== */
  function init() {
    initIcons();
    initHeader();
    initMenu();
    initWhatsappFloat();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
