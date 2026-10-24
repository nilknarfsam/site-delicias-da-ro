import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarMoeda, formatarPorcentagem } from '../js/dominio/formatar.js';

test('vazios, nulos e booleanos usam travessao', () => {
  for (const valor of ['', '  \t ', null, undefined, true, false]) {
    assert.equal(formatarMoeda(valor), '\u2014');
    assert.equal(formatarPorcentagem(valor), '\u2014');
  }
});

test('moeda usa real brasileiro, arredonda na exibição e tem espaço comum', () => {
  assert.equal(formatarMoeda(2.2518), 'R$ 2,25');
  assert.equal(formatarMoeda(4.5036), 'R$ 4,50');
  assert.equal(formatarMoeda(0), 'R$ 0,00');
  assert.equal(formatarMoeda('1234.5'), 'R$ 1.234,50');
});

test('moeda e porcentagem inválidas usam travessão', () => {
  for (const valor of [null, undefined, NaN, Infinity, -Infinity, 'inválido']) {
    assert.equal(formatarMoeda(valor), '—');
    assert.equal(formatarPorcentagem(valor), '—');
  }
});

test('porcentagens usam fração, vírgula e no máximo uma casa decimal', () => {
  assert.equal(formatarPorcentagem(0.3), '30 %');
  assert.equal(formatarPorcentagem(1 / 3), '33,3 %');
  assert.equal(formatarPorcentagem(0), '0 %');
  assert.equal(formatarPorcentagem('1'), '100 %');
});
