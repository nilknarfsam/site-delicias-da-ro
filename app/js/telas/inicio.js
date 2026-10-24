import { escapar } from '../modules/templates.js';

const ATALHOS = [
  { rota: '#/dispensa', titulo: 'Dispensa' },
  { rota: '#/biblioteca', titulo: 'Biblioteca' },
  { rota: '#/precificacao', titulo: 'Precificação' },
  { rota: '#/orcamentos', titulo: 'Orçamentos' },
];

function extrairPrimeiroNome(nomeCompleto) {
  const limpo = String(nomeCompleto ?? '').trim();
  if (!limpo) return 'Rô';
  return limpo.split(/\s+/)[0];
}

export function renderizarInicio(container, { nomeUsuario, nomeAtelie } = {}) {
  const primeiroNome = extrairPrimeiroNome(nomeUsuario);
  const subtitulo = nomeAtelie || 'Delícias da Rô';

  const cartoesHtml = ATALHOS.map((item) => `
    <a class="atalho" href="${escapar(item.rota)}">
      <h2 class="atalho__titulo">${escapar(item.titulo)}</h2>
      <span class="atalho__selo">Em breve</span>
    </a>
  `).join('');

  container.innerHTML = `
    <section>
      <header class="cabecalho-tela">
        <h1>Olá, ${escapar(primeiroNome)}</h1>
        <p class="cabecalho-tela__subtitulo">${escapar(subtitulo)}</p>
      </header>
      <div class="atalhos">
        ${cartoesHtml}
      </div>
    </section>
  `;
}
