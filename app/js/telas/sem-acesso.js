import { sair } from '../dados/sessao.js';
import { escapar } from '../modules/templates.js';

export function renderizarSemAcesso(container, { codigo, mensagem } = {}) {
  const textoExplicacao = mensagem
    || 'O Franklin precisa liberar a sua conta no ateliê. Envie o código abaixo para ele concluir a liberação.';

  container.innerHTML = `
    <section class="painel painel--central">
      <h1>Acesso ainda não liberado</h1>
      <p>${escapar(textoExplicacao)}</p>

      <div class="codigo-acesso">
        <label class="codigo-acesso__rotulo" for="campo-codigo-acesso">Código da sua conta</label>
        <div class="codigo-acesso__linha">
          <input
            id="campo-codigo-acesso"
            class="codigo-acesso__campo"
            type="text"
            readonly
            value="${escapar(codigo)}"
          >
          <button id="botao-copiar-codigo" type="button" class="botao botao--principal">
            Copiar código
          </button>
        </div>
        <p id="aviso-copia" class="codigo-acesso__aviso" aria-live="polite"></p>
      </div>

      <div class="painel__acoes">
        <button id="botao-sair-sem-acesso" type="button" class="botao botao--contorno">
          Sair
        </button>
      </div>
    </section>
  `;

  const campo = container.querySelector('#campo-codigo-acesso');
  const botaoCopiar = container.querySelector('#botao-copiar-codigo');
  const avisoCopia = container.querySelector('#aviso-copia');
  const botaoSair = container.querySelector('#botao-sair-sem-acesso');

  botaoCopiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(codigo ?? ''));
      avisoCopia.textContent = 'Código copiado';
    } catch {
      campo.focus();
      campo.select();
      avisoCopia.textContent = 'Código selecionado. Use Ctrl+C ou copiar no celular.';
    }
  });

  botaoSair.addEventListener('click', () => {
    sair();
  });
}
