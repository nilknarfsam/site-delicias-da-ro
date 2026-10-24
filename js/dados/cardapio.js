// Cardápio do site público.
// Regras (CLAUDE.md): só foto real de produto; nada inventado; preço só se a Rô decidir mostrar.
// Preços de venda autorizados pelo Franklin em 24/10/2026; nunca custo.
// foto: { arquivo: nome base em imagens/produtos/ (sem -480/-800), alt } ou null (foto real pendente).

export const mostrarPrecos = true;

export const avisoRetirada =
  'Bentô Cakes e bolos pequenos são delicados: retirada no ateliê, só por carro particular ou de aplicativo. Não é permitido o transporte por moto.';

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
      {
        id: 'mini-vintage-coracao',
        nome: 'Mini Vintage de Coração',
        descricao: 'Bolo de 10 cm, massa de chocolate ou branca, recheio de chocolate, prestígio, leite Ninho ou doce de leite. Ideal para presentear.',
        aPartirDe: 50,
        foto: null,
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
        descricao: 'Bolo de 10 cm com 2 camadas de massa e 1 de recheio, em embalagem para presente. Modelos vintage e com laço. Massa de chocolate ou branca; recheio de chocolate, prestígio, doce de leite ou leite Ninho.',
        aPartirDe: 45,
        foto: { arquivo: 'bento-cake-morangos', alt: 'Bentô Cake branco com morangos frescos no topo, laço vermelho e coraçõezinhos.' },
        destaque: true,
      },
    ],
  },
  {
    id: 'bolos-decorados',
    nome: 'Bolos personalizados',
    descricao: 'Do aro 11 cm ao aro 25 cm, com massa branca (amanteigada) ou de chocolate e cobertura de chantininho.',
    itens: [
      { id: 'bolo-decorado', nome: 'Bolos personalizados', descricao: 'Escolha o tamanho pela quantidade de fatias. Recheios premium têm acréscimo; topo e glitter são cobrados à parte.', aPartirDe: 100, foto: null },
      { id: 'bolo-dois-andares', nome: 'Bolos de 2 andares e temáticos', descricao: '[PENDENTE: descrição]', foto: null },
    ],
    tabelaTamanhos: [
      { fatias: '7 a 9', aro: '11 cm', preco: 100 },
      { fatias: '10 a 12', aro: '13 cm', preco: 135 },
      { fatias: '12 a 15', aro: '15 cm', preco: 152 },
      { fatias: '16 a 19', aro: '17 cm', preco: 200 },
      { fatias: '20 a 25', aro: '20 cm', preco: 226 },
      { fatias: '38 a 40', aro: '25 cm', preco: 279 },
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
      { id: 'kit-parabens', nome: 'Kit Parabéns', descricao: 'Decoração personalizada: balão médio, topo de bolo, 3 quadros A4 e faixa "Parabéns". O bolo é à parte: 11 cm por R$ 100 ou 15 cm por R$ 152.', aPartirDe: 50, foto: null },
      { id: 'kit-festa', nome: 'Kit Festa', descricao: 'Bolo, cupcakes e brigadeiros gourmet, com display de mesa ou arranjo de balão. Do bolo de 11 cm ao de 17 cm.', aPartirDe: 152, foto: null },
      { id: 'kit-festa-na-mesa', nome: 'Kit Festa na Mesa', descricao: 'Painel de 40 cm, bolo de 15 cm, 6 cupcakes com tags, 20 brigadeiros gourmet e display de mesa.', aPartirDe: 285, foto: null },
      { id: 'kit-mesversario', nome: 'Kit Mêsversário', descricao: 'Bolo de 15 cm, cupcakes, brigadeiros gourmet, papelaria completa e arranjo de balões.', aPartirDe: 350, foto: null },
    ],
  },
];

export const destaques = () =>
  categorias.flatMap((c) => c.itens.map((i) => ({ ...i, categoria: c.id }))).filter((i) => i.destaque);
