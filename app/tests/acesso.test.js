import test from 'node:test';
import assert from 'node:assert/strict';
import { derivarAcesso } from '../js/modules/acesso.js';

const usuario = { uid: 'usuario-teste' };

test('sessão indefinida indica carregamento, mesmo com erro anterior', () => {
  assert.deepEqual(derivarAcesso({ usuario: undefined, erro: new Error('anterior') }),
    { estado: 'carregando' });
});

test('sessão nula indica sem login, mesmo com ateliê e erro anteriores', () => {
  assert.deepEqual(derivarAcesso({ usuario: null, atelie: {}, erro: new Error('anterior') }),
    { estado: 'sem-login' });
});

test('erro gera mensagem amigável sem expor detalhes técnicos', () => {
  const resultado = derivarAcesso({ usuario, erro: { code: 'unavailable', message: 'detalhe técnico' } });
  assert.deepEqual(resultado, {
    estado: 'erro',
    mensagem: 'Não foi possível verificar seu acesso. Tente novamente em instantes.',
  });
});

test('permissão negada indica sem acesso e oferece o código, mesmo com ateliê anterior', () => {
  const resultado = derivarAcesso({ usuario, atelie: {}, erro: { code: 'permission-denied' } });
  assert.equal(resultado.estado, 'sem-acesso');
  assert.equal(resultado.codigo, usuario.uid);
  assert.match(resultado.mensagem, /Franklin/);
});

test('usuário sem ateliê recebe o código para liberação', () => {
  for (const atelie of [null, undefined]) {
    assert.deepEqual(derivarAcesso({ usuario, atelie }), {
      estado: 'sem-acesso',
      mensagem: 'Seu acesso ainda não foi liberado. Envie este código ao Franklin.',
      codigo: usuario.uid,
    });
  }
});

for (const papel of ['dona', 'gestor']) {
  test(`membro com papel ${papel} recebe acesso e nome do ateliê sem alterar os dados`, () => {
    const entrada = { usuario, atelie: { nome: 'Ateliê de teste', membros: { [usuario.uid]: papel } } };
    const antes = structuredClone(entrada);
    assert.deepEqual(derivarAcesso(entrada), { estado: 'liberado', nomeAtelie: 'Ateliê de teste', papel });
    assert.deepEqual(entrada, antes);
  });
}

test('erro tem prioridade sobre um ateliê carregado anteriormente', () => {
  assert.equal(derivarAcesso({ usuario, atelie: {}, erro: new Error('falha') }).estado, 'erro');
});
