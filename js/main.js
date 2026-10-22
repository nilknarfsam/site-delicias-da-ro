// Único ponto de entrada do site público.
import { iniciarRoteador } from './modules/roteador.js';
import { iniciarMenu } from './modules/menu.js';
import { prepararLinksWhatsApp } from './modules/whatsapp.js';
import { iniciarInicio } from './telas/inicio.js';
import { iniciarCardapio } from './telas/cardapio.js';

// Comparação das fontes de título enquanto o Franklin escolhe: ?fonte=cormorant
const fonte = new URLSearchParams(location.search).get('fonte');
if (fonte === 'cormorant') document.documentElement.dataset.fonte = 'cormorant';

const aoAbrirView = (app) => prepararLinksWhatsApp(app);

const rotas = {
  inicio:            { view: 'html/inicio.html',           titulo: 'Início',           iniciar: iniciarInicio },
  cardapio:          { view: 'html/cardapio.html',         titulo: 'Cardápio',         iniciar: iniciarCardapio },
  encomendas:        { view: 'html/encomendas.html',       titulo: 'Encomendas',       iniciar: aoAbrirView },
  'datas-especiais': { view: 'html/datas-especiais.html',  titulo: 'Datas especiais',  iniciar: aoAbrirView },
  sobre:             { view: 'html/sobre.html',            titulo: 'Sobre a Rô',       iniciar: aoAbrirView },
  contato:           { view: 'html/contato.html',          titulo: 'Contato',          iniciar: aoAbrirView },
};

iniciarMenu();
prepararLinksWhatsApp(document);
document.getElementById('ano').textContent = String(new Date().getFullYear());
iniciarRoteador(rotas);
