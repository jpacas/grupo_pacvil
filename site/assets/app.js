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
