import { categorias, avisoRetirada } from '../dados/cardapio.js';
import { escapar, cartaoProduto } from '../modules/templates.js';
import { prepararLinksWhatsApp } from '../modules/whatsapp.js';

export function iniciarCardapio(app) {
  const atalhos = app.querySelector('[data-cardapio-atalhos]');
  const lista = app.querySelector('[data-cardapio-lista]');
  if (!atalhos || !lista) return;

  atalhos.innerHTML = categorias
    .map((c) => `<li><a class="chip" href="#/cardapio/${escapar(c.id)}">${escapar(c.nome)}</a></li>`)
    .join('');

  lista.innerHTML = categorias.map((c, indice) => `
    <section class="categoria" id="${escapar(c.id)}" aria-labelledby="titulo-${escapar(c.id)}">
      <header class="categoria__cabecalho">
        <h2 id="titulo-${escapar(c.id)}">${escapar(c.nome)}</h2>
        ${c.descricao ? `<p class="categoria__descricao">${escapar(c.descricao)}</p>` : ''}
      </header>
      <div class="grade-cartoes">
        ${c.itens.map((item) => cartaoProduto(item, {
          carregarTarde: indice > 0,
          comAviso: Boolean(c.aviso),
          avisoTexto: avisoRetirada,
        })).join('')}
      </div>
    </section>`).join('');

  prepararLinksWhatsApp(app);
}
