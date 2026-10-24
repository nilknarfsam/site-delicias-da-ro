// Regras confirmadas pelo Franklin em 24/10/2026.
import { categorias } from './cardapio.js';

export const passos = [
  { texto: 'Escolha no cardápio', link: '#/cardapio' },
  { texto: 'Chame a Rô no WhatsApp', whatsapp: true },
  { texto: 'Combine os detalhes e pague o sinal' },
  { texto: 'Retire a sua encomenda na confeitaria' },
];

export const regras = [
  { id: 'sinal', texto: 'Encomenda confirmada com o pagamento de 50% do valor.', confirmado: true },
  { id: 'antecedencia', texto: 'Antecedência mínima de 3 dias. Não trabalhamos com pronta entrega: tudo é feito sob encomenda.', confirmado: true },
  { id: 'retirada', texto: 'Retirada na confeitaria, no dia e horário combinados no pedido.', confirmado: true },
  { id: 'entrega', texto: 'Não fazemos entregas: todas as encomendas são retiradas na confeitaria.', confirmado: true },
  { id: 'pagamento', texto: 'Pagamento: PIX, dinheiro e cartões de crédito e débito.', confirmado: true },
  { id: 'extras', texto: 'Topo, glitter e embalagens são cobrados à parte.', confirmado: true },
];

export const sabores = [
  { texto: 'Massas: branca ou chocolate.', confirmado: true },
  { texto: 'Cobertura de chantininho.', confirmado: true },
  { texto: 'Recheios tradicionais: chocolate, prestígio, leite Ninho, 4 leites.', confirmado: true },
  { texto: 'Recheios premium: Ninho com morango, maracujá, Ninho com Nutella, Ninho com geleia de morango (com acréscimo conforme o tamanho do bolo).', confirmado: true },
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
  produtos: nome === 'Páscoa'
    ? 'Ovos de colher em vários sabores, ovos tradicionais com guloseimas e ovos Uno, Duo e Trio de 50 g.'
    : '[PENDENTE: produtos da época]',
  foto: null,
  mensagem: `Olá, Rô! Vim pelo site e quero uma encomenda para ${nome}.`,
}));
