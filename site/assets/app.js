const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const params = new URLSearchParams(window.location.search);
if (params.get('ok') === '1') {
  const form = document.querySelector('form.card');
  if (form) {
    const msg = document.createElement('p');
    msg.className = 'notice';
    msg.style.color = '#9ff3d3';
    msg.style.marginBottom = '12px';
    msg.textContent = '¡Gracias! Tu propuesta fue enviada. Te responderemos en 48–72h hábiles.';
    form.prepend(msg);
  }
}

// Anti-spam client-side (complementa protecciones de Formspree)
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  const startedAt = Date.now();
  const tsField = document.getElementById('tsField');
  if (tsField) tsField.value = String(startedAt);

  leadForm.addEventListener('submit', (e) => {
    const honey = leadForm.querySelector('input[name="company_website"]');
    const elapsedMs = Date.now() - startedAt;

    // Bloquea bots que llenan honeypot o envían demasiado rápido (< 4s)
    if ((honey && honey.value.trim() !== '') || elapsedMs < 4000) {
      e.preventDefault();
      const warn = document.createElement('p');
      warn.className = 'notice';
      warn.style.color = '#ffb4b4';
      warn.style.marginTop = '10px';
      warn.textContent = 'No se pudo enviar. Intenta nuevamente en unos segundos.';
      leadForm.appendChild(warn);
    }
  });
}
