import { observarSessao, sair } from './dados/sessao.js';
import { garantirUsuario } from './dados/usuarios.js';
import { buscarAtelieDoUsuario, observarConexao } from './dados/ateliers.js';
import { derivarAcesso } from './modules/acesso.js';
import { iniciarRoteador, limparMarcacaoRoteador } from './roteador.js';
import { renderizarCarregando } from './telas/carregando.js';
import { renderizarLogin } from './telas/login.js';
import { renderizarSemAcesso } from './telas/sem-acesso.js';
import { renderizarErro } from './telas/erro.js';
import { renderizarInicio } from './telas/inicio.js';
import { renderizarDispensa } from './telas/dispensa.js';
import { renderizarEmBreve } from './telas/em-breve.js';

const conteudo = document.getElementById('conteudo');
const navegacao = document.getElementById('navegacao');
const cabecalhoAtelie = document.getElementById('cabecalho-atelie');
const cabecalhoAcoes = document.getElementById('cabecalho-acoes');
const botaoSair = document.getElementById('botao-sair');
const avisoConexao = document.getElementById('aviso-conexao');

let estadoAtual = 'carregando';
let dadosAcesso = { estado: 'carregando' };
let usuarioAtual = undefined;
let atelieAtual = null;
let sequenciaSessao = 0;

function focarTituloTela() {
  const titulo = conteudo.querySelector('h1');
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
}

function atualizarCromo({ liberado, nomeAtelie }) {
  navegacao.hidden = !liberado;
  cabecalhoAcoes.hidden = !liberado;

  if (liberado && nomeAtelie) {
    cabecalhoAtelie.textContent = nomeAtelie;
    cabecalhoAtelie.hidden = false;
  } else {
    cabecalhoAtelie.textContent = '';
    cabecalhoAtelie.hidden = true;
  }

  if (!liberado) {
    limparMarcacaoRoteador();
  }
}

function renderizarRotaLiberada(rota) {
  if (rota === 'inicio') {
    renderizarInicio(conteudo, {
      nomeUsuario: usuarioAtual?.displayName || usuarioAtual?.email || '',
      nomeAtelie: dadosAcesso.nomeAtelie,
    });
    return null;
  }
  if (rota === 'dispensa') {
    return renderizarDispensa(conteudo, {
      atelierId: atelieAtual?.id || '',
      uid: usuarioAtual?.uid || '',
    });
  }
  renderizarEmBreve(conteudo, rota);
  return null;
}

function aplicarEstado(acesso) {
  dadosAcesso = acesso;
  estadoAtual = acesso.estado;

  const liberado = estadoAtual === 'liberado';
  atualizarCromo({ liberado, nomeAtelie: acesso.nomeAtelie });

  if (estadoAtual === 'carregando') {
    renderizarCarregando(conteudo);
    return;
  }

  if (estadoAtual === 'sem-login') {
    renderizarLogin(conteudo);
    focarTituloTela();
    return;
  }

  if (estadoAtual === 'sem-acesso') {
    renderizarSemAcesso(conteudo, {
      codigo: acesso.codigo,
      mensagem: acesso.mensagem,
    });
    focarTituloTela();
    return;
  }

  if (estadoAtual === 'erro') {
    renderizarErro(conteudo, {
      mensagem: acesso.mensagem,
      aoTentarDeNovo: () => window.location.reload(),
    });
    focarTituloTela();
    return;
  }

  if (liberado) {
    iniciarRoteador({
      container: conteudo,
      obterEstado: () => estadoAtual,
      aoNavegar: renderizarRotaLiberada,
    });
  }
}

aplicarEstado(derivarAcesso({ usuario: undefined }));

observarConexao(({ online }) => {
  avisoConexao.hidden = Boolean(online);
});

botaoSair.addEventListener('click', () => {
  sair();
});

observarSessao(async (user) => {
  const minhaSequencia = ++sequenciaSessao;
  usuarioAtual = user;
  atelieAtual = null;

  if (!user) {
    aplicarEstado(derivarAcesso({ usuario: null }));
    return;
  }

  aplicarEstado(derivarAcesso({ usuario: undefined }));

  try {
    await garantirUsuario(user);
    const atelie = await buscarAtelieDoUsuario(user.uid);
    if (minhaSequencia !== sequenciaSessao) return;
    atelieAtual = atelie;
    aplicarEstado(derivarAcesso({ usuario: user, atelie, erro: null }));
  } catch (erro) {
    if (minhaSequencia !== sequenciaSessao) return;
    aplicarEstado(derivarAcesso({ usuario: user, atelie: null, erro }));
  }
});
