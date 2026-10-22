// Cardápio do site público.
// Regras (CLAUDE.md): só foto real de produto; nada inventado; preço só se a Rô decidir mostrar.
// Enquanto a Rô não decidir, mostrarPrecos = false e nenhum valor entra aqui.
// foto: { arquivo: nome base em imagens/produtos/ (sem -480/-800), alt } ou null (foto real pendente).

export const mostrarPrecos = false;

export const avisoRetirada =
  'Bentô Cakes e bolos pequenos são delicados: retirada no ateliê, por carro particular. Não fazemos transporte por moto.';

export const categorias = [
  {
    id: 'bolos-vintage',
    nome: 'Bolos vintage personalizados',
    descricao: 'Bolos vintage personalizados para tornar sua festa inesquecível.',
    itens: [
      {
        id: 'vintage-coracao',
        nome: 'Bolo vintage coração',
        descricao: 'Formato de coração, todo em chocolate, com bico de confeitar e laços.',
        foto: { arquivo: 'bolo-vintage-coracao-chocolate', alt: 'Bolo em formato de coração coberto de chocolate, com borda confeitada e laços marrons.' },
        destaque: true,
      },
      {
        id: 'vintage-lacos',
        nome: 'Bolo vintage com laços',
        descricao: 'Cobertura clara, borda confeitada e laços de fita.',
        foto: { arquivo: 'bolo-vintage-lacos-dourados', alt: 'Bolo vintage creme com laços dourados e topo com frase personalizada.' },
        destaque: true,
      },
      {
        id: 'vintage-frase',
        nome: 'Bolo vintage com frase',
        descricao: 'Topo com frase personalizada.',
        foto: { arquivo: 'bolo-vintage-lacos-marrons', alt: 'Bolo vintage creme com laços marrons e topo com frase divertida.' },
      },
    ],
  },
  {
    id: 'bento-cake',
    nome: 'Bentô Cake',
    descricao: 'Pequeno no tamanho, gigante no sabor.',
    aviso: true,
    itens: [
      {
        id: 'bento-cake',
        nome: 'Bentô Cake',
        descricao: 'Bolo pequeno e delicado, com acabamento vintage.',
        foto: { arquivo: 'bento-cake-morangos', alt: 'Bentô Cake branco com morangos frescos no topo, laço vermelho e coraçõezinhos.' },
        destaque: true,
      },
    ],
  },
  {
    id: 'bolos-decorados',
    nome: 'Bolos decorados e temáticos',
    descricao: '',
    itens: [
      { id: 'bolo-decorado', nome: 'Bolos decorados', descricao: '[PENDENTE: descrição]', foto: null },
      { id: 'bolo-dois-andares', nome: 'Bolos de 2 andares e temáticos', descricao: '[PENDENTE: descrição]', foto: null },
    ],
  },
  {
    id: 'bolos-caseiros',
    nome: 'Bolos caseiros',
    descricao: '',
    itens: [
      { id: 'bolo-caseiro', nome: 'Bolos caseiros', descricao: '[PENDENTE: sabores]', foto: null },
    ],
  },
  {
    id: 'doces',
    nome: 'Doces, brigadeiros e cupcakes',
    descricao: '',
    itens: [
      { id: 'doces-brigadeiros', nome: 'Doces e brigadeiros', descricao: '[PENDENTE: sabores]', foto: null },
      { id: 'cupcakes', nome: 'Cupcakes', descricao: '[PENDENTE: descrição]', foto: null },
    ],
  },
  {
    id: 'kits',
    nome: 'Kits',
    descricao: 'O combo perfeito para sua comemoração.',
    itens: [
      { id: 'kit-festa', nome: 'Kit Festa', descricao: '[PENDENTE: o que vem no kit]', foto: null },
      { id: 'kit-mesversario', nome: 'Kit Mêsversário', descricao: '[PENDENTE: o que vem no kit]', foto: null },
    ],
  },
];

export const destaques = () =>
  categorias.flatMap((c) => c.itens.map((i) => ({ ...i, categoria: c.id }))).filter((i) => i.destaque);
