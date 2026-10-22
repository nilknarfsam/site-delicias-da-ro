import { passos, regras, sabores, perguntasFrequentes } from '../dados/encomendas.js';
import { avisoRetirada } from '../dados/cardapio.js';
import { escapar } from '../modules/templates.js';
import { prepararLinksWhatsApp } from '../modules/whatsapp.js';

const textoComConfirmacao = (item) => `${escapar(item.texto)}${item.confirmado
  ? ''
  : ' <span class="pendente">[PENDENTE: confirmar com a Rô]</span>'}`;

export function iniciarEncomendas(app) {
  app.querySelector('[data-encomendas-passos]').innerHTML = passos.map((passo) => {
    const texto = escapar(passo.texto);
    if (passo.link) return `<li><a href="${escapar(passo.link)}">${texto}</a></li>`;
    if (passo.whatsapp) return `<li><a data-whatsapp href="#/contato">${texto}</a></li>`;
    return `<li>${texto}</li>`;
  }).join('');

  app.querySelector('[data-encomendas-regras]').innerHTML = regras
    .map((regra) => `<li>${textoComConfirmacao(regra)}</li>`).join('');
  app.querySelector('[data-encomendas-sabores]').innerHTML = sabores
    .map((sabor) => `<li>${textoComConfirmacao(sabor)}</li>`).join('');
  app.querySelector('[data-encomendas-aviso]').innerHTML = escapar(avisoRetirada);
  app.querySelector('[data-encomendas-faq]').innerHTML = perguntasFrequentes.map((item) => {
    const resposta = item.resposta || regras.find((regra) => regra.id === item.regra);
    return `<details>
      <summary>${escapar(item.pergunta)}</summary>
      <p>${textoComConfirmacao(resposta)}</p>
    </details>`;
  }).join('');

  prepararLinksWhatsApp(app);
}
