/* ============================================================
   AM CASA — script.js
   Sem dependências além do Lucide (ícones).
   Blocos:
     01. Ícones (Lucide)
     02. Header: sombra e esconder/mostrar na rolagem
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
        header.classList.toggle("is-hidden", isScrollingDown && y > HIDE_AFTER);
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
    initWhatsappFloat();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
