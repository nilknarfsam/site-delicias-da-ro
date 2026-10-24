const ROTAS_VALIDAS = new Set([
  'inicio',
  'dispensa',
  'biblioteca',
  'precificacao',
  'orcamentos',
  'ajustes',
]);

let estadoGetter = () => '';
let renderizadorRota = null;
let containerAlvo = null;
let ouvinteAtivo = false;

function obterNomeRota() {
  const hash = window.location.hash;
  if (!hash.startsWith('#/')) return null;
  const nome = hash.slice(2).split('/')[0];
  return ROTAS_VALIDAS.has(nome) ? nome : null;
}

function marcarItemAtivo(rotaAtiva) {
  document.querySelectorAll('[data-rota]').forEach((link) => {
    if (link.getAttribute('data-rota') === rotaAtiva) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function focarTitulo(container) {
  const titulo = container?.querySelector('h1');
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
  window.scrollTo(0, 0);
}

function processarRota() {
  if (estadoGetter() !== 'liberado') return;

  let nome = obterNomeRota();
  if (!nome) {
    nome = 'inicio';
    history.replaceState(null, '', '#/inicio');
  }

  if (typeof renderizadorRota === 'function') {
    renderizadorRota(nome);
  }

  marcarItemAtivo(nome);
  focarTitulo(containerAlvo);
}

function aoMudarHash() {
  if (estadoGetter() !== 'liberado') return;
  processarRota();
}

function aoClicarDocumento(evento) {
  const pular = evento.target.closest?.('a.pular');
  if (pular && containerAlvo) {
    evento.preventDefault();
    const titulo = containerAlvo.querySelector('h1') || containerAlvo;
    titulo.setAttribute('tabindex', '-1');
    titulo.focus();
    return;
  }

  if (estadoGetter() !== 'liberado') return;
  const link = evento.target.closest?.('a[href^="#/"]');
  if (link && link.getAttribute('href') === window.location.hash) {
    evento.preventDefault();
    focarTitulo(containerAlvo);
  }
}

export function iniciarRoteador({ container, obterEstado, aoNavegar }) {
  containerAlvo = container;
  estadoGetter = obterEstado;
  renderizadorRota = aoNavegar;

  if (!ouvinteAtivo) {
    window.addEventListener('hashchange', aoMudarHash);
    document.addEventListener('click', aoClicarDocumento);
    ouvinteAtivo = true;
  }

  processarRota();
}

export function limparMarcacaoRoteador() {
  marcarItemAtivo('');
}
