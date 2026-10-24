import { entrarComGoogle } from '../dados/sessao.js';
import { escapar } from '../modules/templates.js';

function mensagemErroLogin(erro) {
  const codigo = erro?.code || '';
  if (codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request') {
    return 'A janela de login foi fechada antes de concluir. Quando quiser, clique novamente para entrar.';
  }
  if (codigo === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela de login. Permita janelas pop-up para este site e tente novamente.';
  }
  if (codigo === 'auth/network-request-failed') {
    return 'Sem conexão no momento. Confira a internet e tente novamente.';
  }
  return 'Não foi possível entrar com o Google agora. Tente novamente em instantes.';
}

export function renderizarLogin(container) {
  container.innerHTML = `
    <section class="painel painel--central">
      <h1>Área da Rô</h1>
      <p>Entre com a sua conta Google para acessar a precificação e os dados do ateliê.</p>
      <div class="painel__acoes">
        <button id="botao-entrar-google" type="button" class="botao botao--principal">
          Entrar com Google
        </button>
      </div>
      <p id="erro-login" class="alerta-erro" role="alert" hidden></p>
    </section>
  `;

  const botao = container.querySelector('#botao-entrar-google');
  const alerta = container.querySelector('#erro-login');

  botao.addEventListener('click', async () => {
    alerta.hidden = true;
    alerta.textContent = '';
    botao.disabled = true;
    try {
      await entrarComGoogle();
    } catch (erro) {
      alerta.innerHTML = escapar(mensagemErroLogin(erro));
      alerta.hidden = false;
      botao.disabled = false;
    }
  });
}
