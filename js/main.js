/**
 * 35 Receitas de Tapioca da Dona Rosa — Interações da Landing Page
 * - Carrossel de páginas reais com setas + Modal de Zoom
 * - Accordion acessível de Perguntas Frequentes
 * - Barra fixa mobile (aparece entre o Hero e a seção de Preços)
 * - Repasse automático de parâmetros UTM para links de checkout
 */

(function () {
  'use strict';

  // 1. Carrossel de Páginas Reais + Zoom Modal
  const pageTrack = document.getElementById('pageTrack');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageDialog = document.getElementById('pageDialog');
  const dialogImage = document.getElementById('dialogImage');
  const closeDialogBtn = document.getElementById('closePage');

  if (pageTrack && prevPageBtn && nextPageBtn) {
    const scrollPages = (direction) => {
      const card = pageTrack.querySelector('.page-card');
      const step = card ? card.getBoundingClientRect().width + 18 : 270;
      pageTrack.scrollBy({ left: direction * step, behavior: 'smooth' });
    };

    prevPageBtn.addEventListener('click', () => scrollPages(-1));
    nextPageBtn.addEventListener('click', () => scrollPages(1));

    if (pageDialog && dialogImage && closeDialogBtn) {
      pageTrack.querySelectorAll('.page-card button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const img = btn.querySelector('img');
          if (!img) return;
          dialogImage.src = img.dataset.full || img.src;
          dialogImage.alt = img.alt;
          if (typeof pageDialog.showModal === 'function') {
            pageDialog.showModal();
          }
        });
      });

      closeDialogBtn.addEventListener('click', () => pageDialog.close());
      pageDialog.addEventListener('click', (e) => {
        if (e.target === pageDialog) pageDialog.close();
      });
    }
  }

  // 2. FAQ Accordion suave
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const panel = item.querySelector('.faq-answer');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Fecha os demais itens
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq-question');
          const otherPanel = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // 3. Barra fixa de CTA no mobile
  const mobileSticky = document.getElementById('mobileStickyCta');
  const heroSection = document.getElementById('inicio');
  const pricingSection = document.getElementById('pricing');

  if (mobileSticky && heroSection && pricingSection && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let pricingVisible = false;

    const syncSticky = () => {
      mobileSticky.classList.toggle('is-visible', !heroVisible && !pricingVisible);
    };

    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        syncSticky();
      },
      { threshold: 0.08 }
    );

    const pricingObserver = new IntersectionObserver(
      (entries) => {
        pricingVisible = entries[0].isIntersecting;
        syncSticky();
      },
      { threshold: 0.12 }
    );

    heroObserver.observe(heroSection);
    pricingObserver.observe(pricingSection);
  }

  // 4. Repasse de UTMs + InitiateCheckout no Meta Pixel
  const queryParams = new URLSearchParams(window.location.search);
  const hasParams = [...queryParams.keys()].length > 0;

  document.querySelectorAll('a.checkout-link').forEach((link) => {
    if (hasParams) {
      try {
        const url = new URL(link.href);
        queryParams.forEach((val, key) => url.searchParams.set(key, val));
        link.href = url.toString();
      } catch (_) {
        // Ignora links âncora ou inválidos
      }
    }

    link.addEventListener('click', () => {
      if (typeof window.fbq === 'function') {
        const val = parseFloat(link.dataset.value || '14.90');
        const plan = link.dataset.plan || '35 Receitas de Tapioca';
        window.fbq('track', 'InitiateCheckout', {
          value: val,
          currency: 'BRL',
          content_name: plan
        });
      }
    });
  });
})();
