import test from 'node:test';
import assert from 'node:assert/strict';
import { derivarStatus } from '../js/dominio/status.js';

const ingrediente = { precoBase: 2, quantidadeBase: 100, quantidadeUsada: 20, unidadeBase: 'g' };
const receita = { ingredientes: [ingrediente], isPrecified: true };

test('receita completa está pronta', () => {
  assert.deepEqual(derivarStatus(receita), {
    tipo: 'pronta', rotulo: 'Pronta', contemEstimativas: false, contemAlternativas: false, itensPendentes: [],
  });
});

test('precificação não concluída é pendente', () => {
  const status = derivarStatus({ ...receita, isPrecified: false });
  assert.equal(status.tipo, 'pendente');
  assert.equal(status.rotulo, 'Pendente');
  assert.deepEqual(status.itensPendentes, ['Precificação ainda não concluída']);
});

test('estimativas e alternativas exigem revisão', () => {
  for (const campos of [{ precisaRevisao: true }, { grupoAlternativa: ' gordura ' }]) {
    const status = derivarStatus({ ...receita, ingredientes: [{ ...ingrediente, ...campos }] });
    assert.equal(status.tipo, 'revisarDados');
    assert.equal(status.rotulo, 'Revisar dados');
    assert.equal(status.itensPendentes.at(-1), 'Revisar dados antes de concluir');
  }
});

test('itens pendentes aparecem na ordem exata, com prioridade para pendente', () => {
  const status = derivarStatus({ ingredientes: [{ precisaRevisao: true, grupoAlternativa: 'gordura' }] });
  assert.equal(status.tipo, 'pendente');
  assert.equal(status.contemEstimativas, true);
  assert.equal(status.contemAlternativas, true);
  assert.deepEqual(status.itensPendentes, [
    'Precificação ainda não concluída', 'Contém estimativas de ingredientes',
    'Há ingredientes alternativos', 'Faltam dados essenciais para cálculo final', 'Revisar dados antes de concluir',
  ]);
});

test('sem ingredientes faltam dados essenciais', () => {
  for (const campos of [{}, { ingredientes: [] }]) {
    assert.deepEqual(derivarStatus({ ...campos, isPrecified: true }).itensPendentes,
      ['Faltam dados essenciais para cálculo final']);
  }
});

test('cada campo numérico inválido, inclusive NaN, indica falta de dados', () => {
  for (const campo of ['precoBase', 'quantidadeBase', 'quantidadeUsada']) {
    for (const valor of [0, -1, NaN, Infinity, -Infinity, undefined, 'inválido']) {
      const status = derivarStatus({ ...receita, ingredientes: [{ ...ingrediente, [campo]: valor }] });
      assert.equal(status.tipo, 'pendente', campo);
      assert.deepEqual(status.itensPendentes, ['Faltam dados essenciais para cálculo final']);
    }
  }
});

test('unidade em branco indica falta de dados', () => {
  for (const unidadeBase of ['', '  \t ', undefined, null]) {
    assert.equal(derivarStatus({ ...receita, ingredientes: [{ ...ingrediente, unidadeBase }] }).tipo, 'pendente');
  }
});

test('somente true marca estimativa; grupo em branco é ignorado; números em texto são aceitos', () => {
  const entrada = { ...receita, ingredientes: [{
    precoBase: '2', quantidadeBase: '100', quantidadeUsada: '20', unidadeBase: ' g ',
    precisaRevisao: 'true', grupoAlternativa: '  ',
  }] };
  const antes = structuredClone(entrada);
  assert.equal(derivarStatus(entrada).tipo, 'pronta');
  assert.deepEqual(entrada, antes);
});
