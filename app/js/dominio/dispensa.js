import { normalizarIngrediente } from './normalizar.js';
import { formatarMoeda } from './formatar.js';

export const UNIDADES = [
  { id: 'g', rotulo: 'g', base: 'g', fator: 1, tipoMedida: 'peso' },
  { id: 'kg', rotulo: 'kg', base: 'g', fator: 1000, tipoMedida: 'peso' },
  { id: 'ml', rotulo: 'ml', base: 'ml', fator: 1, tipoMedida: 'volume' },
  { id: 'L', rotulo: 'L', base: 'ml', fator: 1000, tipoMedida: 'volume' },
  { id: 'un', rotulo: 'unidade', base: 'un', fator: 1, tipoMedida: 'unidade' },
];

function limparEspacos(texto) {
  return String(texto ?? '').trim().replace(/\s+/g, ' ');
}

function numero(valor) {
  if (typeof valor === 'number') return valor;
  if (typeof valor !== 'string' || valor.trim() === '') return NaN;
  return Number(valor.trim().replace(',', '.'));
}

export function paraArmazenamento({ nome, preco, quantidade, unidade }) {
  const medida = UNIDADES.find((item) => item.id === unidade);
  if (!medida) throw new Error('Unidade inválida.');
  return {
    nome: limparEspacos(nome),
    precoBase: numero(preco),
    quantidadeBase: numero(quantidade) * medida.fator,
    unidadeBase: medida.base,
    // O formato antigo agrupa peso e volume; a unidade real permanece na base.
    tipoMedida: medida.base === 'un' ? 'unidade' : 'peso',
  };
}

export function paraFormulario(ingrediente) {
  const { nome, precoBase, quantidadeBase, unidadeBase } = ingrediente;
  const maior = quantidadeBase >= 1000 && (unidadeBase === 'g' || unidadeBase === 'ml');
  return {
    nome,
    preco: precoBase,
    quantidade: maior ? quantidadeBase / 1000 : quantidadeBase,
    unidade: maior ? (unidadeBase === 'g' ? 'kg' : 'L') : unidadeBase,
  };
}

export function validarIngrediente(dados, existentes = [], idAtual = null) {
  const erros = {};
  const avisos = {};
  const nome = limparEspacos(dados.nome);
  if (!nome) erros.nome = 'Informe o nome do ingrediente.';
  for (const campo of ['preco', 'quantidade']) {
    const valor = numero(dados[campo]);
    if (!Number.isFinite(valor) || valor <= 0) {
      erros[campo] = campo === 'preco'
        ? 'Informe um preço maior que zero.' : 'Informe uma quantidade maior que zero.';
    }
  }
  if (!UNIDADES.some((item) => item.id === dados.unidade)) {
    erros.unidade = 'Escolha uma unidade válida.';
  }
  const duplicado = nome && existentes.find((item) => (
    (idAtual == null || item.id !== idAtual)
    && normalizarIngrediente(item.nome) === normalizarIngrediente(nome)
  ));
  if (duplicado) avisos.duplicado = duplicado.nome;
  return { valido: Object.keys(erros).length === 0, erros, avisos };
}

export function precoReferencia(ingrediente) {
  const { precoBase, quantidadeBase, unidadeBase } = ingrediente;
  const fator = unidadeBase === 'un' ? 1 : 1000;
  const unidade = unidadeBase === 'g' ? 'kg' : unidadeBase === 'ml' ? 'L' : 'un';
  return `${formatarMoeda(precoBase / quantidadeBase * fator)}/${unidade}`;
}

export function descreverEmbalagem(ingrediente) {
  const { preco, quantidade, unidade } = paraFormulario(ingrediente);
  const quantidadeTexto = String(quantidade).replace('.', ',');
  return `${formatarMoeda(preco)} por ${quantidadeTexto} ${unidade}`;
}

export function chaveBusca(texto) {
  return limparEspacos(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filtrarIngredientes(lista, termo) {
  const busca = chaveBusca(termo);
  return lista.filter((item) => chaveBusca(item.nome).includes(busca))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function mudouPreco(antes, depois) {
  return ['precoBase', 'quantidadeBase', 'unidadeBase']
    .some((campo) => antes[campo] !== depois[campo]);
}
