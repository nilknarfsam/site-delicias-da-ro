import { categorias, destaques, avisoRetirada } from '../dados/cardapio.js';
import { escapar, cartaoProduto } from '../modules/templates.js';
import { prepararLinksWhatsApp } from '../modules/whatsapp.js';

export function iniciarInicio(app) {
  const grade = app.querySelector('[data-destaques]');
  if (grade) {
    grade.innerHTML = destaques()
      .map((item) => cartaoProduto(item, {
        comAviso: item.categoria === 'bento-cake',
        avisoTexto: avisoRetirada,
      }))
      .join('');
  }

  const previa = app.querySelector('[data-previa-cardapio]');
  if (previa) {
    previa.innerHTML = categorias
      .map((c) => `<li><a class="chip" href="#/cardapio/${escapar(c.id)}">${escapar(c.nome)}</a></li>`)
      .join('');
  }

  prepararLinksWhatsApp(app);
}
