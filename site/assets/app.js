const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Mobile menu (drawer)
(function setupMobileMenu() {
  const nav = document.querySelector('.nav');
  const navInner = document.querySelector('.nav-inner');
  const menu = document.querySelector('.menu');
  if (!nav || !navInner || !menu) return;

  const btn = document.createElement('button');
  btn.className = 'menu-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Abrir menú');
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = '☰';

  navInner.insertBefore(btn, navInner.children[2] || null);

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? '✕' : '☰';
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    });
  });
})();

// Back to top
(function setupBackToTop() {
  const b = document.createElement('button');
  b.className = 'btn btn-ghost';
  b.textContent = '↑';
  b.setAttribute('aria-label', 'Volver arriba');
  b.style.position = 'fixed';
  b.style.left = '14px';
  b.style.bottom = '14px';
  b.style.zIndex = '60';
  b.style.display = 'none';
  b.style.width = '42px';
  b.style.height = '42px';
  b.style.padding = '0';
  b.style.fontSize = '20px';
  b.style.boxShadow = '0 8px 20px rgba(15,23,42,.15)';
  document.body.appendChild(b);

  const toggle = () => {
    b.style.display = window.scrollY > 420 ? 'inline-flex' : 'none';
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  b.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// GA4
(function setupGA4() {
  const GA_ID = 'G-B2V5CVTPP8';
  if (!GA_ID) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
  });
})();

const params = new URLSearchParams(window.location.search);
if (params.get('ok') === '1') {
  const form = document.querySelector('form.card');
  if (form) {
    const msg = document.createElement('p');
    msg.className = 'notice';
    msg.style.color = '#9ff3d3';
    msg.style.marginBottom = '12px';
    msg.textContent = '¡Gracias! Tu propuesta fue enviada. Te responderemos en hasta 1 semana.';
    form.prepend(msg);
  }
}

// Conversión principal: thank-you page dedicada
if (window.location.pathname.endsWith('/gracias.html')) {
  const key = 'pacvil_lead_fired_v1';
  if (!sessionStorage.getItem(key) && typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', {
      form_name: 'propuesta_inversion',
      channel: 'website',
      value: 1,
      currency: 'USD',
    });
    sessionStorage.setItem(key, '1');
  }
}

// Anti-spam client-side (complementa protecciones de Formspree)
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  const startedAt = Date.now();
  const tsField = document.getElementById('tsField');
  if (tsField) tsField.value = String(startedAt);

  const submitBtn = document.getElementById('submitBtn');
  const RATE_KEY = 'pacvil_lead_rate_v1';
  const WINDOW_MS = 60 * 60 * 1000; // 1h
  const MAX_SUBMITS = 3; // por navegador

  function readRateLog() {
    try {
      const raw = localStorage.getItem(RATE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function writeRateLog(list) {
    localStorage.setItem(RATE_KEY, JSON.stringify(list));
  }

  function showWarn(text) {
    const warn = document.createElement('p');
    warn.className = 'notice';
    warn.style.color = '#ffb4b4';
    warn.style.marginTop = '10px';
    warn.textContent = text;
    leadForm.appendChild(warn);
  }

  leadForm.addEventListener('submit', (e) => {
    const honey = leadForm.querySelector('input[name="company_website"]');
    const elapsedMs = Date.now() - startedAt;

    const email = leadForm.querySelector('input[name="correo"]');
    const amount = leadForm.querySelector('input[name="monto"]');

    // Bloquea bots que llenan honeypot o envían demasiado rápido (< 4s)
    if ((honey && honey.value.trim() !== '') || elapsedMs < 4000) {
      e.preventDefault();
      showWarn('No se pudo enviar. Intenta nuevamente en unos segundos.');
      return;
    }

    // Validaciones rápidas para reducir spam basura
    if (email && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      e.preventDefault();
      showWarn('Correo inválido. Verifica e intenta nuevamente.');
      return;
    }

    if (amount && amount.value.trim() && !/^[0-9.,\s$]+$/.test(amount.value.trim())) {
      e.preventDefault();
      showWarn('Monto inválido. Usa números (ej: 500000).');
      return;
    }

    // Rate limit local (por navegador)
    const now = Date.now();
    const recent = readRateLog().filter((t) => now - Number(t) < WINDOW_MS);
    if (recent.length >= MAX_SUBMITS) {
      e.preventDefault();
      showWarn('Has enviado varias propuestas recientemente. Intenta de nuevo en 1 hora.');
      return;
    }

    recent.push(now);
    writeRateLog(recent);

    // anti doble click
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
  });
}
