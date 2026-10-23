// Dados comerciais da confeitaria (fonte: conteudo/dados-da-confeitaria.md).
// Só contato comercial. Nada de endereço residencial.

export const site = {
  nome: 'Delícias da Rô',
  slogan: 'Sabores que encantam',
  responsavel: 'Chef Rosangela Vieira',
  cidade: 'Manaus – AM',
  whatsapp: {
    numero: '5592981681827',          // (92) 98168-1827
    exibicao: '(92) 98168-1827',
    mensagemPadrao: 'Olá, Rô! Vim pelo site e quero fazer uma encomenda.',
  },
  // Contador de visitas (GoatCounter, sem cookies). Código vazio = contador desligado.
  // Ex.: 'deliciasdaro' para https://deliciasdaro.goatcounter.com
  contador: { codigo: '' },
  // Números da página inicial. Só números reais passados pela Rô (docs/07).
  // Formato: { valor: '10', rotulo: 'anos de confeitaria' }. Lista vazia = seção escondida.
  numeros: [],
  instagram: {
    usuario: '@chefrosangelavieira',
    url: 'https://instagram.com/chefrosangelavieira',
  },
  horario: 'Segunda a sábado, das 9h às 18h', // a confirmar com a Rô (docs/07)
};
