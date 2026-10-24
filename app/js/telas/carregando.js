export function renderizarCarregando(container) {
  container.innerHTML = `
    <section class="painel painel--central carregando" role="status" aria-live="polite">
      <div class="carregando__indicador" aria-hidden="true"></div>
      <h1>Carregando…</h1>
    </section>
  `;
  const titulo = container.querySelector('h1');
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
}
