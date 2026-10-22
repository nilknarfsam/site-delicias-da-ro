// Roteador por hash (o GitHub Pages não redireciona rotas para o index.html).
import { marcarMenuAtivo, fecharMenu } from './menu.js';
import { telaErro } from './templates.js';

const NOME_SITE = 'Delícias da Rô';
let rotas = {};
let app;
let navegacaoAtual = 0;
const cache = new Map();

async function carregarView(caminho) {
  if (!cache.has(caminho)) {
    const resposta = await fetch(caminho);
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status + ' em ' + caminho);
    cache.set(caminho, await resposta.text());
  }
  return cache.get(caminho);
}

async function renderizar() {
  let [nome, secao] = location.hash.slice(2).split('/');
  if (!nome || !rotas[nome]) {
    nome = 'inicio';
    secao = undefined;
    history.replaceState(null, '', '#/inicio');
  }
  const rota = rotas[nome];
  const esta = ++navegacaoAtual;
  app.setAttribute('aria-busy', 'true');

  let html;
  let titulo = rota.titulo;
  let ok = true;
  try {
    html = await carregarView(rota.view);
  } catch (erro) {
    console.error('[roteador]', erro);
    ok = false;
    titulo = 'Página indisponível';
    html = telaErro(titulo, navigator.onLine
      ? 'Não encontramos este conteúdo.'
      : 'Você parece estar sem conexão. Confira a internet e tente de novo.');
  }
  if (esta !== navegacaoAtual) return;

  const molde = document.createElement('template');
  molde.innerHTML = html;
  app.replaceChildren(molde.content);
  app.removeAttribute('aria-busy');
  document.title = nome === 'inicio' && ok ? `${NOME_SITE} | Sabores que encantam` : `${NOME_SITE} | ${titulo}`;
  marcarMenuAtivo(ok ? nome : '');

  if (ok && rota.iniciar) {
    try { rota.iniciar(app); } catch (e) { console.error('[roteador]', e); }
  }

  const alvo = (secao && document.getElementById(secao)) || app.querySelector('h1');
  if (alvo) {
    alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
  }
  window.scrollTo(0, 0);
}

export function iniciarRoteador(mapa) {
  rotas = mapa;
  app = document.getElementById('app');
  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#/')) return; // âncoras comuns (ex.: #app) não são rotas
    fecharMenu();
    renderizar();
  });
  app.addEventListener('click', (e) => {
    if (e.target.closest('[data-acao="recarregar-view"]')) renderizar();
  });
  renderizar();
}
