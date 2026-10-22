export const escapar = (t) => String(t ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function renderizarLista(container, itens, template) {
  container.innerHTML = itens.map(template).join('');
}

export function telaErro(titulo, mensagem) {
  return `
    <section class="container erro-tela">
      <h1>${escapar(titulo)}</h1>
      <p>${escapar(mensagem)}</p>
      <p><button type="button" class="botao botao--contorno" data-acao="recarregar-view">Tentar de novo</button></p>
      <p><a href="#/inicio">Voltar para o início</a></p>
    </section>`;
}
