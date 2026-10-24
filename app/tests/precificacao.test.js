import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularCustoIngrediente, calcularPrecificacao } from '../js/dominio/precificacao.js';
import { derivarStatus } from '../js/dominio/status.js';
import { formatarMoeda } from '../js/dominio/formatar.js';

function proximo(real, esperado) {
  assert.ok(Math.abs(real - esperado) < 1e-9, `${real} ≠ ${esperado}`);
}

function exemplo() {
  return {
    ingredientes: [
      { nome: 'Farinha de trigo', precoBase: 6, quantidadeBase: 1000, quantidadeUsada: 300, unidadeBase: 'g' },
      { nome: 'Açúcar', precoBase: 5, quantidadeBase: 1000, quantidadeUsada: 250, unidadeBase: 'g' },
      { nome: 'Ovos', precoBase: 18, quantidadeBase: 30, quantidadeUsada: 4, unidadeBase: 'un' },
      { nome: 'Chocolate em pó', precoBase: 24, quantidadeBase: 400, quantidadeUsada: 80, unidadeBase: 'g' },
      { nome: 'Manteiga', precoBase: 12, quantidadeBase: 200, quantidadeUsada: 100, unidadeBase: 'g', grupoAlternativa: 'gordura' },
      { nome: 'Margarina', precoBase: 8, quantidadeBase: 500, quantidadeUsada: 100, unidadeBase: 'g', grupoAlternativa: 'gordura' },
    ],
    custosAdicionais: [{ nome: 'Topper', valor: 8 }],
    taxaOperacional: 0.3, margem: 1, rendimentoQuantidade: 14, rendimentoTipo: 'fatia', isPrecified: true,
  };
}

test('exemplo exato da seção 4, sem arredondamento intermediário', () => {
  const receita = exemplo();
  const resultado = calcularPrecificacao(receita);
  [1.8, 1.25, 2.4, 4.8, 6, 0].forEach((valor, indice) =>
    proximo(resultado.ingredientes[indice].custoCalculado, valor));
  const esperados = {
    custoIngredientes: 16.25, custoAdicional: 8, custoInsumos: 24.25,
    taxaOperacional: 0.3, valorTaxaOperacional: 7.275, custoTotal: 31.525,
    margem: 1, precoSugerido: 63.05, custoPorUnidade: 31.525 / 14, precoPorUnidade: 63.05 / 14,
  };
  for (const [campo, valor] of Object.entries(esperados)) proximo(resultado[campo], valor);
  assert.equal(formatarMoeda(resultado.custoPorUnidade), 'R$ 2,25');
  assert.equal(formatarMoeda(resultado.precoPorUnidade), 'R$ 4,50');
  assert.equal(derivarStatus(receita).tipo, 'revisarDados');
});

test('base inválida usa 1; entradas são convertidas em números finitos', () => {
  for (const quantidadeBase of [0, -1, NaN, Infinity, 'inválido']) {
    proximo(calcularCustoIngrediente({ precoBase: '2', quantidadeBase, quantidadeUsada: '3' }), 6);
  }
  for (const valor of [NaN, Infinity, -Infinity, 'inválido', undefined]) {
    proximo(calcularCustoIngrediente({ precoBase: valor, quantidadeBase: 1, quantidadeUsada: 2 }), 0);
    proximo(calcularCustoIngrediente({ precoBase: 2, quantidadeBase: 1, quantidadeUsada: valor }), 0);
  }
});

test('receita sem ingredientes tem custos e preços zerados', () => {
  const resultado = calcularPrecificacao({});
  assert.deepEqual(resultado, {
    ingredientes: [], custoIngredientes: 0, custoAdicional: 0, custoInsumos: 0,
    taxaOperacional: 0.3, valorTaxaOperacional: 0, custoTotal: 0, margem: 1,
    precoSugerido: 0, custoPorUnidade: null, precoPorUnidade: null,
  });
});

test('taxa e margem zero são respeitadas; custos indiretos são ignorados', () => {
  const receita = { ...exemplo(), taxaOperacional: 0, margem: 0, custosIndiretos: [{ valor: 999 }] };
  const resultado = calcularPrecificacao(receita);
  proximo(resultado.custoTotal, 24.25);
  proximo(resultado.precoSugerido, 24.25);
  proximo(resultado.valorTaxaOperacional, 0);
});

test('rendimento ausente ou inválido não gera valores por unidade', () => {
  for (const rendimentoQuantidade of [undefined, null, 0, -2, NaN, Infinity, 'inválido']) {
    const resultado = calcularPrecificacao({ ...exemplo(), rendimentoQuantidade });
    assert.equal(resultado.custoPorUnidade, null);
    assert.equal(resultado.precoPorUnidade, null);
  }
});

test('cálculo mantém a entrada e copia todos os ingredientes', () => {
  const receita = exemplo();
  const antes = structuredClone(receita);
  const resultado = calcularPrecificacao(receita);
  assert.deepEqual(receita, antes);
  assert.notStrictEqual(resultado.ingredientes, receita.ingredientes);
  resultado.ingredientes.forEach((ing, indice) => assert.notStrictEqual(ing, receita.ingredientes[indice]));
});

test('grupos têm trim e grupos vazios não excluem ingredientes', () => {
  const receita = exemplo();
  receita.ingredientes[4].grupoAlternativa = 'gordura ';
  receita.ingredientes[5].grupoAlternativa = ' gordura';
  proximo(calcularPrecificacao(receita).custoIngredientes, 16.25);
  receita.ingredientes[4].grupoAlternativa = ' ';
  receita.ingredientes[5].grupoAlternativa = '';
  proximo(calcularPrecificacao(receita).custoIngredientes, 17.85);
});

test('taxas, adicionais e rendimento aceitam números em texto e descartam não finitos', () => {
  const resultado = calcularPrecificacao({
    custosAdicionais: [{ valor: '10' }, { valor: NaN }, { valor: Infinity }, { valor: 'inválido' }],
    taxaOperacional: '0.2', margem: '0.5', rendimentoQuantidade: '2',
  });
  proximo(resultado.custoTotal, 12);
  proximo(resultado.precoSugerido, 18);
  proximo(resultado.precoPorUnidade, 9);
  for (const taxaOperacional of [undefined, null, '', '  ', NaN, Infinity, 'invalido']) {
    const invalido = calcularPrecificacao({ custosAdicionais: [{ valor: 10 }], taxaOperacional, margem: 0 });
    proximo(invalido.custoTotal, 13);
  }
  for (const margem of [undefined, null, '', '  ', NaN, Infinity, 'invalido']) {
    const invalido = calcularPrecificacao({ custosAdicionais: [{ valor: 10 }], taxaOperacional: 0, margem });
    proximo(invalido.precoSugerido, 20);
  }
  for (const valor of [0, '0']) {
    const resultado = calcularPrecificacao({ custosAdicionais: [{ valor: 10 }], taxaOperacional: valor, margem: valor });
    proximo(resultado.custoTotal, 10);
    proximo(resultado.precoSugerido, 10);
  }
});
