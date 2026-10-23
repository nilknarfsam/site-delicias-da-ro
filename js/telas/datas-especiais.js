import { campanhaVintage, datasEspeciais } from '../dados/encomendas.js';
import { escapar, fotoProduto, textoOuPendente } from '../modules/templates.js';
import { prepararLinksWhatsApp } from '../modules/whatsapp.js';

export function iniciarDatasEspeciais(app) {
  app.querySelector('[data-datas-campanha]').innerHTML = `
    <section class="campanha-vintage" aria-labelledby="titulo-campanha-vintage">
      <div class="campanha-vintage__texto">
        <h2 id="titulo-campanha-vintage">${escapar(campanhaVintage.titulo)}</h2>
        <a class="botao botao--principal" data-whatsapp data-mensagem="${escapar(campanhaVintage.mensagem)}" href="#/contato">${escapar(campanhaVintage.botao)}</a>
      </div>
      <div class="campanha-vintage__fotos">
        ${campanhaVintage.fotos.map((item) => fotoProduto(item, false)).join('')}
      </div>
    </section>`;

  app.querySelector('[data-datas-lista]').innerHTML = datasEspeciais.map((data) => `
    <article class="cartao">
      ${fotoProduto(data)}
      <div class="cartao__corpo">
        <h3 class="cartao__titulo">${escapar(data.nome)}</h3>
        <p class="cartao__texto">${escapar(data.descricao)}</p>
        <p class="cartao__texto">${textoOuPendente(data.produtos)}</p>
        <a class="botao botao--principal botao--bloco" data-whatsapp data-mensagem="${escapar(data.mensagem)}" href="#/contato">${escapar('Encomendar para ' + data.nome)}</a>
      </div>
    </article>`).join('');

  prepararLinksWhatsApp(app);
}
