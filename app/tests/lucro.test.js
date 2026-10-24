import test from 'node:test';
import assert from 'node:assert/strict';
import { margemSobrePreco, markupPorMargem, descreverLucro } from '../js/dominio/lucro.js';

test('converte lucro sobre custo em margem sobre preço e vice-versa', () => {
  for (const [markup, margem] of [[0, 0], [1, 0.5], [0.5, 1 / 3], [2, 2 / 3]]) {
    assert.ok(Math.abs(margemSobrePreco(markup) - margem) < 1e-9);
    assert.ok(Math.abs(markupPorMargem(margem) - markup) < 1e-9);
  }
});

test('margem de 100% ou maior não tem markup finito', () => {
  assert.equal(markupPorMargem(1), null);
  assert.equal(markupPorMargem('1.2'), null);
});

test('descrição usa vírgula, no máximo uma casa e sem zeros à direita', () => {
  assert.equal(descreverLucro(1), 'Lucro de 100 % sobre o custo = 50 % do preço de venda');
  assert.equal(descreverLucro(0.5), 'Lucro de 50 % sobre o custo = 33,3 % do preço de venda');
  assert.equal(descreverLucro(0), 'Lucro de 0 % sobre o custo = 0 % do preço de venda');
});

test('converte texto numérico e considera entradas não finitas como zero', () => {
  assert.equal(margemSobrePreco('1'), 0.5);
  for (const valor of [NaN, Infinity, -Infinity, 'inválido', undefined]) {
    assert.equal(margemSobrePreco(valor), 0);
    assert.equal(markupPorMargem(valor), 0);
  }
});
