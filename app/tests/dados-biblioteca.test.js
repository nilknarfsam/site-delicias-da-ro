import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fontes = await Promise.all(['biblioteca', 'precificacoes'].map((nome) =>
  readFile(new URL(`../js/dados/${nome}.js`, import.meta.url), 'utf8')));
const urlModulo = (fonte) => `data:text/javascript;base64,${Buffer.from(fonte).toString('base64')}`;
let sequencia = 0;

async function preparar({ anterior = null, erroLeitura = null } = {}) {
  const chave = `teste-biblioteca-${++sequencia}`;
  const lotes = [];
  const pendentes = [];
  const cancelamento = () => {};
  let contador = 0;
  const sdk = {
    db: {},
    collection: (_db, ...partes) => ({ path: partes.join('/') }),
    doc: (base, ...partes) => {
      const id = partes.at(-1) ?? `novo-${++contador}`;
      return { id, path: [base.path, ...partes, ...(partes.length ? [] : [id])].filter(Boolean).join('/') };
    },
    serverTimestamp: () => 'timestamp-servidor',
    deleteField: () => 'remover-campo',
    getDoc: async () => {
      if (erroLeitura) throw erroLeitura;
      return { exists: () => anterior != null, data: () => anterior };
    },
    onSnapshot: (ref, opcoes, callback) => {
      sdk.observacao = { ref, opcoes, callback };
      return cancelamento;
    },
    writeBatch: () => {
      const operacoes = [];
      lotes.push(operacoes);
      return {
        set: (ref, dados) => operacoes.push({ tipo: 'set', ref, dados }),
        update: (ref, dados) => operacoes.push({ tipo: 'update', ref, dados }),
        delete: (ref) => operacoes.push({ tipo: 'delete', ref }),
        commit: () => new Promise((resolve, reject) => pendentes.push({ resolve, reject })),
      };
    },
  };
  globalThis[chave] = sdk;
  const sdkUrl = urlModulo(`export const { db, collection, doc, serverTimestamp,
    getDoc, onSnapshot, writeBatch, deleteField } = globalThis[${JSON.stringify(chave)}];`);
  const modulos = await Promise.all(fontes.map((fonte) => import(urlModulo(fonte
    .replaceAll("'../firebase.js'", JSON.stringify(sdkUrl))
    .replace("'../dominio/biblioteca.js'", JSON.stringify(new URL('../js/dominio/biblioteca.js', import.meta.url).href))))));
  delete globalThis[chave];
  return { sdk, lotes, pendentes, cancelamento, ...modulos[0], ...modulos[1] };
}

const receita = () => ({ id: 'id-importado', nome: 'Exemplo fictício',
  ingredientes: [{ nome: 'Ingrediente fictício' }] });

test('Biblioteca observa cache e pendências, prevalecendo id e metadados do SDK', async () => {
  const contexto = await preparar();
  let recebido;
  assert.equal(contexto.observarBiblioteca('ro', (dados) => { recebido = dados; }), contexto.cancelamento);
  const { ref, opcoes, callback } = contexto.sdk.observacao;
  assert.equal(ref.path, 'ateliers/ro/biblioteca');
  assert.deepEqual(opcoes, { includeMetadataChanges: true });
  callback({ docs: [{ id: 'local', data: () => ({ ...receita(), pendente: false }),
    metadata: { hasPendingWrites: true } }], metadata: { fromCache: true } });
  assert.deepEqual(recebido, { itens: [{ ...receita(), id: 'local', pendente: true }], doCache: true });
});

test('cadastro e edição devolvem antes do commit, ignoram id importado e preservam criadoEm na edição', async () => {
  const contexto = await preparar();
  const novo = contexto.salvarReceita('ro', 'uid', { ...receita(), pendente: true, atualizadoPor: 'intruso' });
  assert.equal(novo.id, 'novo-1');
  const gravacao = contexto.lotes[0][0];
  assert.equal(gravacao.ref.path, 'ateliers/ro/biblioteca/novo-1');
  assert.equal(gravacao.tipo, 'set');
  assert.equal(gravacao.dados.id, undefined);
  assert.equal(gravacao.dados.pendente, undefined);
  assert.equal(gravacao.dados.criadoEm, 'timestamp-servidor');
  assert.equal(gravacao.dados.atualizadoEm, 'timestamp-servidor');
  assert.equal(gravacao.dados.atualizadoPor, 'uid');
  const editado = contexto.salvarReceita('ro', 'uid', receita(), 'local');
  assert.equal(editado.id, 'local');
  assert.equal(contexto.lotes[1][0].tipo, 'update');
  assert.equal(contexto.lotes[1][0].dados.criadoEm, undefined);
  assert.equal(contexto.lotes[1][0].dados.descricao, 'remover-campo');
  assert.equal(contexto.lotes[1][0].dados.observacoes, 'remover-campo');
  contexto.pendentes.forEach(({ resolve }) => resolve());
  await Promise.all([novo.sincronizado, editado.sincronizado]);
});

test('exclusão e desfazer restauram dados e datas originais sem esperar conexão', async () => {
  const anterior = { ...receita(), criadoEm: 'original', campoExtra: 123 };
  const contexto = await preparar({ anterior });
  const exclusao = await contexto.excluirReceita('ro', 'local');
  assert.deepEqual(contexto.lotes[0], [{ tipo: 'delete',
    ref: { id: 'local', path: 'ateliers/ro/biblioteca/local' } }]);
  const restauracao = exclusao.restaurar();
  assert.deepEqual(contexto.lotes[1], [{ tipo: 'set',
    ref: { id: 'local', path: 'ateliers/ro/biblioteca/local' }, dados: anterior }]);
  contexto.pendentes.forEach(({ resolve }) => resolve());
  await Promise.all([exclusao.sincronizado, restauracao.sincronizado]);
});

test('exclusão ausente ou sem cache retorna mensagem em português e não grava', async () => {
  for (const [opcoes, mensagem] of [[{}, /Receita não encontrada/],
    [{ erroLeitura: new Error('offline') }, /Tente de novo quando a internet voltar/]]) {
    const contexto = await preparar(opcoes);
    await assert.rejects(contexto.excluirReceita('ro', 'local'), mensagem);
    assert.equal(contexto.lotes.length, 0);
  }
});

test('importação usa ids novos e lotes até 450 e sincronização espera todos os lotes', async () => {
  const contexto = await preparar();
  const resultado = contexto.importarReceitas('ro', 'uid', Array.from({ length: 901 }, receita));
  assert.equal(resultado.quantidade, 901);
  assert.deepEqual(contexto.lotes.map((lote) => lote.length), [450, 450, 1]);
  const operacoes = contexto.lotes.flat();
  assert.equal(new Set(operacoes.map(({ ref }) => ref.id)).size, 901);
  for (const { ref, dados } of operacoes) {
    assert.ok(ref.path.startsWith('ateliers/ro/biblioteca/'));
    assert.notEqual(ref.id, 'id-importado');
    assert.equal(dados.id, undefined);
    assert.equal(dados.criadoEm, 'timestamp-servidor');
    assert.equal(dados.atualizadoEm, 'timestamp-servidor');
    assert.equal(dados.atualizadoPor, 'uid');
  }
  let terminou = false;
  resultado.sincronizado.then(() => { terminou = true; });
  contexto.pendentes[0].resolve();
  contexto.pendentes[1].resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(terminou, false);
  contexto.pendentes[2].resolve();
  await resultado.sincronizado;
});

test('importação valida tudo antes de gravar e listas vazias não geram lote', async () => {
  const contexto = await preparar();
  assert.throws(() => contexto.importarReceitas('ro', 'uid', [...Array.from({ length: 451 }, receita), {}]), /nome/);
  assert.equal(contexto.lotes.length, 0);
  await contexto.importarReceitas('ro', 'uid', []).sincronizado;
  await contexto.limparBiblioteca('ro', []).sincronizado;
  assert.equal(contexto.lotes.length, 0);
});

test('limpeza usa somente os ids informados em lotes até 450 e propaga falhas', async () => {
  const contexto = await preparar();
  const ids = Array.from({ length: 451 }, (_, indice) => `local-${indice}`);
  const resultado = contexto.limparBiblioteca('ro', ids);
  assert.equal(resultado.quantidade, 451);
  assert.deepEqual(contexto.lotes.map((lote) => lote.length), [450, 1]);
  assert.deepEqual(contexto.lotes.flat().map(({ ref }) => ref.id), ids);
  assert.ok(contexto.lotes.flat().every(({ tipo, ref }) => tipo === 'delete'
    && ref.path.startsWith('ateliers/ro/biblioteca/')));
  contexto.pendentes[0].resolve();
  contexto.pendentes[1].reject(new Error('Sem permissão'));
  await assert.rejects(resultado.sincronizado, /Sem permissão/);
});

test('rascunho persiste nova precificação com datas e vínculos sem gravar na Biblioteca', async () => {
  const contexto = await preparar();
  const resultado = contexto.criarRascunhoDaReceita('ro', 'uid', receita(), []);
  assert.equal(resultado.id, 'novo-1');
  assert.equal(contexto.lotes.length, 1);
  const operacao = contexto.lotes[0][0];
  assert.equal(operacao.ref.path, 'ateliers/ro/precificacoes/novo-1');
  assert.equal(operacao.dados.origemBibliotecaId, 'id-importado');
  assert.equal(operacao.dados.dataCriacao, 'timestamp-servidor');
  assert.equal(operacao.dados.dataAtualizacao, 'timestamp-servidor');
  assert.equal(operacao.dados.atualizadoPor, 'uid');
  assert.equal(operacao.dados.isPrecified, false);
  assert.equal(operacao.dados.id, undefined);
  contexto.pendentes[0].resolve();
  await resultado.sincronizado;
});

test('falhas de cadastro, importação, exclusão, restauração e rascunho chegam a sincronizado', async () => {
  for (const acao of ['salvar', 'importar', 'excluir', 'restaurar', 'rascunho']) {
    const contexto = await preparar({ anterior: receita() });
    let resultado;
    if (acao === 'salvar') resultado = contexto.salvarReceita('ro', 'uid', receita());
    if (acao === 'importar') resultado = contexto.importarReceitas('ro', 'uid', [receita()]);
    if (acao === 'rascunho') resultado = contexto.criarRascunhoDaReceita('ro', 'uid', receita(), []);
    if (acao === 'excluir' || acao === 'restaurar') {
      resultado = await contexto.excluirReceita('ro', 'local');
      if (acao === 'restaurar') {
        contexto.pendentes[0].resolve();
        await resultado.sincronizado;
        resultado = resultado.restaurar();
      }
    }
    contexto.pendentes.at(-1).reject(new Error('Sem permissão'));
    await assert.rejects(resultado.sincronizado, /Sem permissão/);
  }
});
