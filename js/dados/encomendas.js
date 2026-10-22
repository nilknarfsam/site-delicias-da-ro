// Conteúdo da etapa 1C. Regras e sabores ainda aguardam confirmação da Rô.
// Sem preços: mudar confirmado para true somente depois da confirmação.
import { categorias } from './cardapio.js';

export const passos = [
  { texto: 'Escolha no cardápio', link: '#/cardapio' },
  { texto: 'Chame a Rô no WhatsApp', whatsapp: true },
  { texto: 'Combine os detalhes e pague o sinal' },
  { texto: 'Retire ou receba a sua encomenda' },
];

export const regras = [
  { id: 'sinal', texto: 'Sinal de 50% do valor para confirmar a encomenda.', confirmado: false },
  { id: 'antecedencia', texto: 'Antecedência mínima de 3 dias.', confirmado: false },
  { id: 'retirada', texto: 'Retirada com data e hora marcadas.', confirmado: false },
  { id: 'entrega', texto: 'Fazemos entregas (taxa sob consulta).', confirmado: false },
  { id: 'pagamento', texto: 'Pagamento: PIX, dinheiro e cartões.', confirmado: false },
  { id: 'extras', texto: 'Topo, glitter e embalagens são cobrados à parte.', confirmado: false },
];

export const sabores = [
  { texto: 'Massas: branca ou chocolate.', confirmado: false },
  { texto: 'Cobertura de chantininho.', confirmado: false },
  { texto: 'Recheios tradicionais: chocolate, prestígio, leite Ninho, 4 leites.', confirmado: false },
  { texto: 'Recheios premium (com acréscimo): Ninho com morango, maracujá, Ninho com Nutella, Ninho com geleia de morango.', confirmado: false },
];

export const perguntasFrequentes = [
  { pergunta: 'Com quanto tempo de antecedência devo pedir?', regra: 'antecedencia' },
  { pergunta: 'Vocês entregam?', regra: 'entrega' },
  { pergunta: 'Quais as formas de pagamento?', regra: 'pagamento' },
  {
    pergunta: 'Posso pedir um bolo com personagem?',
    resposta: { texto: 'Sim, a decoração é combinada com a Rô pelo WhatsApp.', confirmado: false },
  },
];

export const campanhaVintage = {
  titulo: 'Campanha vintage',
  // As mesmas fotos reais e descrições já aprovadas no cardápio.
  fotos: categorias.find((categoria) => categoria.id === 'bolos-vintage').itens.slice(0, 2),
  botao: 'Quero um bolo vintage',
  mensagem: 'Olá, Rô! Vim pelo site e quero um bolo vintage.',
};

export const datasEspeciais = ['Dia das Mães', 'Dia dos Namorados', 'Páscoa', 'Natal'].map((nome) => ({
  nome,
  descricao: 'Fale com a Rô com antecedência para garantir a sua encomenda.',
  produtos: '[PENDENTE: produtos da época]',
  foto: null,
  mensagem: `Olá, Rô! Vim pelo site e quero uma encomenda para ${nome}.`,
}));
