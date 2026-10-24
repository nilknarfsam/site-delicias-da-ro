import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarIngrediente } from '../js/dominio/normalizar.js';

test('normaliza espaços e capitalização de cada palavra', () => {
  assert.equal(normalizarIngrediente('  CHOCOLATE  em\tPÓ  '), 'Chocolate Em Pó');
  assert.equal(normalizarIngrediente('leite condensado'), 'Leite Condensado');
});

test('padroniza os apelidos exatos de margarina e açúcar', () => {
  for (const nome of ['deline', ' DELINE ', 'MARGARINA']) assert.equal(normalizarIngrediente(nome), 'Margarina');
  for (const nome of ['acucar', ' AÇÚCAR ']) assert.equal(normalizarIngrediente(nome), 'Açúcar');
  assert.equal(normalizarIngrediente('açúcar refinado'), 'Açúcar Refinado');
  assert.equal(normalizarIngrediente('deline cremosa'), 'Deline Cremosa');
});

test('nomes vazios produzem texto vazio e normalização é idempotente', () => {
  for (const nome of ['', ' \t\n ', undefined, null]) assert.equal(normalizarIngrediente(nome), '');
  const normalizado = normalizarIngrediente(' FARINHA de TRIGO ');
  assert.equal(normalizarIngrediente(normalizado), normalizado);
});
