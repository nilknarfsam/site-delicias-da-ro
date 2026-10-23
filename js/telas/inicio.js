import { categorias, destaques, avisoRetirada } from '../dados/cardapio.js';
import { escapar, cartaoProduto } from '../modules/templates.js';
import { prepararLinksWhatsApp } from '../modules/whatsapp.js';
import { site } from '../dados/site.js';

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

  if (Array.isArray(site.numeros) && site.numeros.length) {
    const listaNumeros = app.querySelector('[data-numeros-lista]');
    const secaoNumeros = app.querySelector('[data-numeros]');
    if (listaNumeros && secaoNumeros) {
      listaNumeros.innerHTML = site.numeros
        .map(({ valor, rotulo }) => `
          <li class="numeros__item">
            <strong class="numeros__valor">${escapar(valor)}</strong>
            <span class="numeros__rotulo">${escapar(rotulo)}</span>
          </li>`)
        .join('');
      secaoNumeros.removeAttribute('hidden');
    }
  }

  prepararLinksWhatsApp(app);
}
