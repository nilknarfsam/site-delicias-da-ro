import test from 'node:test';
import assert from 'node:assert/strict';
import { aplicarCascataDaDispensa } from '../js/dominio/cascata.js';

test('id vazio ou ausente casa somente por nome', () => {
  for (const id of [undefined, '']) {
    const receita = { ingredientes: [
      { ...ingrediente, nome: 'Outro nome', pantryIngredientId: undefined },
      { ...ingrediente, nome: 'Acucar', pantryIngredientId: undefined },
    ] };
    const resultado = aplicarCascataDaDispensa({ ...dispensa, id }, [receita], agora);
    assert.equal(resultado.atualizadas, 1);
    assert.equal(resultado.receitas[0].ingredientes[0].precoBase, 5);
    assert.equal(resultado.receitas[0].ingredientes[1].precoBase, 10);
  }
});

test('vinculo com somente espacos casa por nome', () => {
  const receita = { ingredientes: [{ ...ingrediente, nome: 'Acucar', pantryIngredientId: '  \t ' }] };
  const resultado = aplicarCascataDaDispensa(dispensa, [receita], agora);
  assert.equal(resultado.atualizadas, 1);
  assert.equal(resultado.receitas[0].ingredientes[0].pantryIngredientId, dispensa.id);
  assert.equal(resultado.receitas[0].ingredientes[0].precoBase, dispensa.precoBase);
});

const dispensa = { id: 'acucar', nome: 'Açúcar', precoBase: 10, quantidadeBase: 1000, unidadeBase: 'g', tipoMedida: 'peso' };
const ingrediente = { nome: 'acucar', precoBase: 5, quantidadeBase: 500, quantidadeUsada: 100, unidadeBase: 'kg', tipoMedida: 'unidade' };
const agora = '2026-10-24T12:00:00.000Z';

test('vínculo por id independe do nome e recalcula ingredientes e preço', () => {
  const receita = {
    ingredientes: [{ ...ingrediente, nome: 'Outro nome', pantryIngredientId: 'acucar' }],
    custosAdicionais: [{ valor: 2 }], taxaOperacional: 0.3, margem: 1, dataAtualizacao: 'anterior',
  };
  const antes = structuredClone(receita);
  const resultado = aplicarCascataDaDispensa(dispensa, [receita], agora);
  const atualizada = resultado.receitas[0];
  assert.equal(resultado.atualizadas, 1);
  assert.deepEqual(atualizada.ingredientes[0], {
    ...ingrediente, nome: 'Outro nome', pantryIngredientId: 'acucar',
    precoBase: 10, quantidadeBase: 1000, unidadeBase: 'g', tipoMedida: 'peso', custoCalculado: 1,
  });
  assert.ok(Math.abs(atualizada.custoTotal - 3.9) < 1e-9);
  assert.ok(Math.abs(atualizada.precoSugerido - 7.8) < 1e-9);
  assert.equal(atualizada.dataAtualizacao, agora);
  assert.deepEqual(receita, antes);
});

test('sem vínculo corresponde por nome normalizado, inclusive apelidos', () => {
  for (const pantryIngredientId of [undefined, null, '']) {
    const resultado = aplicarCascataDaDispensa(dispensa, [{
      ingredientes: [{ ...ingrediente, nome: ' ACUCAR ', pantryIngredientId }],
    }], agora);
    assert.equal(resultado.atualizadas, 1);
    assert.equal(resultado.receitas[0].ingredientes[0].pantryIngredientId, 'acucar');
    assert.equal(resultado.receitas[0].ingredientes[0].quantidadeUsada, 100);
  }
  const resultado = aplicarCascataDaDispensa({ ...dispensa, id: 'gordura', nome: 'Margarina' },
    [{ ingredientes: [{ ...ingrediente, nome: 'deline' }] }], agora);
  assert.equal(resultado.atualizadas, 1);
});

test('ligado a outro id não muda, mesmo com nome igual', () => {
  const receita = { ingredientes: [{ ...ingrediente, pantryIngredientId: 'outro' }] };
  const resultado = aplicarCascataDaDispensa(dispensa, [receita], agora);
  assert.equal(resultado.atualizadas, 0);
  assert.strictEqual(resultado.receitas[0], receita);
});

test('conta receitas e mantém a referência das intocadas', () => {
  const alterada = { ingredientes: [ingrediente, { ...ingrediente }] };
  const intocada = { ingredientes: [{ ...ingrediente, nome: 'Farinha' }] };
  const vazia = {};
  const receitas = [alterada, intocada, vazia];
  const antes = structuredClone(receitas);
  const antesDispensa = structuredClone(dispensa);
  const resultado = aplicarCascataDaDispensa(dispensa, receitas, agora);
  assert.equal(resultado.atualizadas, 1);
  assert.notStrictEqual(resultado.receitas, receitas);
  assert.notStrictEqual(resultado.receitas[0], alterada);
  assert.strictEqual(resultado.receitas[1], intocada);
  assert.strictEqual(resultado.receitas[2], vazia);
  assert.deepEqual(receitas, antes);
  assert.deepEqual(dispensa, antesDispensa);
});

test('dados já sincronizados não contam como mudança nem renovam a data', () => {
  const receita = { ingredientes: [{
    ...dispensa, quantidadeUsada: 100, pantryIngredientId: dispensa.id, custoCalculado: 1,
  }], dataAtualizacao: 'anterior' };
  const resultado = aplicarCascataDaDispensa(dispensa, [receita], agora);
  assert.equal(resultado.atualizadas, 0);
  assert.strictEqual(resultado.receitas[0], receita);
});

test('recálculo preserva exclusão de alternativas e usa data padrão ISO', () => {
  const receita = { ingredientes: [
    { ...ingrediente, grupoAlternativa: 'grupo' },
    { ...ingrediente, grupoAlternativa: 'grupo' },
  ] };
  const inicio = Date.now();
  const resultado = aplicarCascataDaDispensa(dispensa, [receita]);
  const fim = Date.now();
  const atualizada = resultado.receitas[0];
  assert.equal(atualizada.ingredientes[0].custoCalculado, 1);
  assert.equal(atualizada.ingredientes[1].custoCalculado, 0);
  assert.ok(Math.abs(atualizada.precoSugerido - 2.6) < 1e-9);
  assert.ok(Date.parse(atualizada.dataAtualizacao) >= inicio);
  assert.ok(Date.parse(atualizada.dataAtualizacao) <= fim);
  assert.equal(new Date(atualizada.dataAtualizacao).toISOString(), atualizada.dataAtualizacao);
});
