// Único ponto de entrada do site público.
import { iniciarRoteador } from './modules/roteador.js';
import { iniciarMenu } from './modules/menu.js';
import { prepararLinksWhatsApp } from './modules/whatsapp.js';
import { iniciarInicio } from './telas/inicio.js';
import { iniciarCardapio } from './telas/cardapio.js';
import { iniciarEncomendas } from './telas/encomendas.js';
import { iniciarDatasEspeciais } from './telas/datas-especiais.js';
import { site } from './dados/site.js';
import { escapar } from './modules/templates.js';
import { iniciarContador } from './modules/contador.js';

// Comparação das fontes de título enquanto o Franklin escolhe: ?fonte=cormorant
const fonte = new URLSearchParams(location.search).get('fonte');
if (fonte === 'cormorant') document.documentElement.dataset.fonte = 'cormorant';

const aoAbrirView = (app) => {
  app.querySelectorAll('[data-site-instagram]').forEach((link) => {
    link.innerHTML = escapar(site.instagram.usuario);
    link.href = site.instagram.url;
    link.target = '_blank';
    link.rel = 'noopener';
  });
  app.querySelectorAll('[data-site-whatsapp]').forEach((el) => {
    el.innerHTML = escapar(site.whatsapp.exibicao);
  });
  app.querySelectorAll('[data-site-horario]').forEach((el) => {
    el.innerHTML = escapar(site.horario);
  });
  prepararLinksWhatsApp(app);
};

const rotas = {
  inicio:            { view: 'html/inicio.html',           titulo: 'Início',           iniciar: iniciarInicio },
  cardapio:          { view: 'html/cardapio.html',         titulo: 'Cardápio',         iniciar: iniciarCardapio },
  encomendas:        { view: 'html/encomendas.html',       titulo: 'Encomendas',       iniciar: iniciarEncomendas },
  'datas-especiais': { view: 'html/datas-especiais.html',  titulo: 'Datas especiais',  iniciar: iniciarDatasEspeciais },
  sobre:             { view: 'html/sobre.html',            titulo: 'Sobre a Rô',       iniciar: aoAbrirView },
  contato:           { view: 'html/contato.html',          titulo: 'Contato',          iniciar: aoAbrirView },
};

iniciarMenu();
prepararLinksWhatsApp(document);
document.getElementById('ano').textContent = String(new Date().getFullYear());
iniciarRoteador(rotas);
iniciarContador();
