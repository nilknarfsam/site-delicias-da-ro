import { escapar } from '../modules/templates.js';

export function renderizarErro(container, { mensagem, aoTentarDeNovo } = {}) {
  const texto = mensagem || 'Não foi possível verificar seu acesso. Tente novamente em instantes.';

  container.innerHTML = `
    <section class="painel painel--central" role="alert">
      <h1>Não foi possível carregar</h1>
      <p>${escapar(texto)}</p>
      <div class="painel__acoes">
        <button id="botao-tentar-novamente" type="button" class="botao botao--principal">
          Tentar de novo
        </button>
      </div>
    </section>
  `;

  const botao = container.querySelector('#botao-tentar-novamente');
  botao.addEventListener('click', () => {
    if (typeof aoTentarDeNovo === 'function') {
      aoTentarDeNovo();
    } else {
      window.location.reload();
    }
  });
}
