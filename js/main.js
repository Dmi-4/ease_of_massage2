/* ==========================================================================
   Serene — vanilla JS only, no third-party JS libraries. Guard-claused init functions.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------- Header scroll state */
  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------------------------------------- Mobile nav toggle */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    var close = function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    var open = function () {
      links.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };

    toggle.addEventListener("click", function () {
      if (links.classList.contains("is-open")) close();
      else open();
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* -------------------------------------------------- Smooth scroll w/ offset */
  function initSmoothScroll() {
    var header = document.getElementById("siteHeader");
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = (header ? header.offsetHeight : 0) + 14;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* -------------------------------------------------- Scroll reveal */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------- Services filter */
  function initServiceFilter() {
    var tabs = document.querySelectorAll(".menu-tab");
    var items = document.querySelectorAll("#menuGrid .menu-item");
    if (!tabs.length || !items.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        items.forEach(function (item) {
          var show = filter === "all" || item.getAttribute("data-cat") === filter;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* -------------------------------------------------- Testimonials slider */
  function initQuotes() {
    var track = document.getElementById("quotesTrack");
    if (!track) return;
    var slides = track.querySelectorAll(".quote");
    var dots = document.querySelectorAll("#quotesDots .quotes__dot");
    var prev = document.getElementById("quotePrev");
    var next = document.getElementById("quoteNext");
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;

    var go = function (i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
      dots.forEach(function (d, n) { d.classList.toggle("is-active", n === index); });
    };

    var start = function () {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(function () { go(index + 1); }, 6500);
    };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };

    if (prev) prev.addEventListener("click", function () { go(index - 1); start(); });
    if (next) next.addEventListener("click", function () { go(index + 1); start(); });
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () { go(n); start(); });
    });

    var quotesWrap = track.closest(".quotes");
    if (quotesWrap) {
      quotesWrap.addEventListener("mouseenter", stop);
      quotesWrap.addEventListener("mouseleave", start);
    }

    go(0);
    start();
  }

  /* -------------------------------------------------- Booking form */
  function initBookingForm() {
    var form = document.getElementById("bookingForm");
    if (!form) return;
    var status = document.getElementById("formStatus");

    // Min date = today; nudge default to next open day is optional — keep min only.
    var dateInput = form.querySelector("#bf-date");
    if (dateInput) {
      var today = new Date();
      var pad = function (n) { return String(n).padStart(2, "0"); };
      dateInput.min = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
    }

    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var validateField = function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input || !input.hasAttribute("required")) return true;
      var value = (input.value || "").trim();
      var ok = value.length > 0;
      if (ok && input.type === "email") ok = emailRe.test(value);
      field.classList.toggle("has-error", !ok);
      return ok;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll(".field");
      var allOk = true;
      var firstBad = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstBad) firstBad = field;
        if (!ok) allOk = false;
      });

      if (!allOk) {
        if (status) status.classList.remove("is-visible");
        if (firstBad) {
          var bad = firstBad.querySelector("input, select, textarea");
          if (bad) bad.focus();
        }
        return;
      }

      if (status) {
        status.classList.add("is-visible");
        status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      form.reset();
      if (dateInput && dateInput.min) { /* keep min after reset */ }
    });

    // Clear error as the guest fixes a field
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      var evt = input.tagName === "SELECT" ? "change" : "input";
      input.addEventListener(evt, function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("has-error")) validateField(field);
      });
    });
  }

  /* -------------------------------------------------- Newsletter (footer) */
  function initNewsletter() {
    var form = document.getElementById("newsForm");
    if (!form) return;
    var input = form.querySelector("input[type=email]");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input) return;
      var ok = emailRe.test((input.value || "").trim());
      if (!ok) { input.focus(); return; }
      input.value = "";
      input.setAttribute("placeholder", "Thank you — see you soon.");
    });
  }

  /* -------------------------------------------------- Gallery lightbox */
  function initLightbox() {
    var box = document.getElementById("lightbox");
    var img = document.getElementById("lightboxImg");
    var closeBtn = document.getElementById("lightboxClose");
    var figures = document.querySelectorAll("#gallery-grid figure[data-full]");
    if (!box || !img || !figures.length) return;

    var lastFocus = null;
    var open = function (src, alt) {
      img.src = src;
      img.alt = alt || "";
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    };
    var close = function () {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    figures.forEach(function (fig) {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      var thumb = fig.querySelector("img");
      var openFromFig = function () {
        lastFocus = fig;
        open(fig.getAttribute("data-full"), thumb ? thumb.alt : "");
      };
      fig.addEventListener("click", openFromFig);
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFromFig(); }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
    });
  }

  /* -------------------------------------------------- Highlight today's hours */
  function initHours() {
    var list = document.getElementById("hoursList");
    if (!list) return;
    var today = new Date().getDay(); // 0 = Sunday
    var rows = list.querySelectorAll("li[data-day]");
    rows.forEach(function (row) {
      if (parseInt(row.getAttribute("data-day"), 10) === today) row.classList.add("is-today");
    });
  }

  /* -------------------------------------------------- Boot */
  function boot() {
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initReveal();
    initServiceFilter();
    initQuotes();
    initBookingForm();
    initNewsletter();
    initLightbox();
    initHours();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
