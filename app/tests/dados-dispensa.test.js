import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Carrega os repositórios reais com um SDK em memória, sem rede nem dependências.
const fonteDispensa = await readFile(new URL('../js/dados/dispensa.js', import.meta.url), 'utf8');
const fonteCascata = await readFile(new URL('../js/dados/cascata-dispensa.js', import.meta.url), 'utf8');
let sequencia = 0;
const urlModulo = (fonte) => `data:text/javascript;base64,${Buffer.from(fonte).toString('base64')}`;

async function preparar({ anterior = null, receitas = [], historico = [], getDocErro = null, getDocsErro = null } = {}) {
  const chave = `teste-dispensa-${++sequencia}`;
  const lotes = [];
  const consultas = [];
  const pendentes = [];
  const cancelamento = () => {};
  let contador = 0;
  const documento = (id, dados, pendente = false) => ({
    id, ref: { id, path: `ateliers/ro/precificacoes/${id}` },
    data: () => dados, exists: () => dados != null, metadata: { hasPendingWrites: pendente },
  });
  const sdk = {
    db: {},
    collection: (_db, ...partes) => ({ path: partes.join('/') }),
    doc: (base, ...partes) => {
      const id = partes.at(-1) ?? `novo-${++contador}`;
      return { id, path: [base.path, ...partes, ...(partes.length ? [] : [id])].filter(Boolean).join('/') };
    },
    serverTimestamp: () => 'timestamp-servidor',
    getDoc: async (ref) => {
      if (getDocErro) throw getDocErro;
      return documento(ref.id, anterior);
    },
    getDocs: async (consulta) => {
      if (getDocsErro) throw getDocsErro;
      consultas.push(consulta);
      const itens = consulta.path.endsWith('/precificacoes') ? receitas : historico;
      return { empty: itens.length === 0, docs: itens.map((item) => documento(item.id, item)) };
    },
    query: (colecao, ...filtros) => ({ ...colecao, filtros }),
    where: (...argumentos) => argumentos,
    onSnapshot: (ref, opcoes, callback) => {
      sdk.observacao = { ref, opcoes, callback };
      return cancelamento;
    },
    writeBatch: () => {
      const operacoes = [];
      const lote = { operacoes, commits: 0 };
      lotes.push(lote);
      return {
        set: (ref, dados) => operacoes.push({ tipo: 'set', ref, dados }),
        update: (ref, dados) => operacoes.push({ tipo: 'update', ref, dados }),
        delete: (ref) => operacoes.push({ tipo: 'delete', ref }),
        commit: () => {
          lote.commits += 1;
          return new Promise((resolve, reject) => pendentes.push({ resolve, reject }));
        },
      };
    },
  };
  globalThis[chave] = sdk;
  const sdkUrl = urlModulo(`const sdk = globalThis[${JSON.stringify(chave)}];
    export const { db, collection, doc, serverTimestamp, getDoc, getDocs, query, where,
      onSnapshot, writeBatch } = sdk;`);
  const adaptar = (fonte) => fonte.replaceAll("'../firebase.js'", JSON.stringify(sdkUrl))
    .replace(/'\.\.\/dominio\/([^']+)'/g, (_, arquivo) =>
      JSON.stringify(new URL(`../js/dominio/${arquivo}`, import.meta.url).href));
  const cascataUrl = urlModulo(adaptar(fonteCascata));
  const cascata = await import(cascataUrl);
  const dispensa = await import(urlModulo(adaptar(fonteDispensa)
    .replace("'./cascata-dispensa.js'", JSON.stringify(cascataUrl))));
  delete globalThis[chave];
  return { sdk, lotes, consultas, pendentes, documento, cancelamento, ...dispensa, ...cascata };
}

const ingrediente = {
  nome: 'Açúcar', precoBase: 12, quantidadeBase: 500, unidadeBase: 'g', tipoMedida: 'peso',
};
const receita = (id, vinculada = true) => ({
  id, nome: 'Exemplo fictício', campoPreservado: 'original',
  ingredientes: [{ ...ingrediente, precoBase: 6, quantidadeUsada: 100,
    pantryIngredientId: vinculada ? 'ing' : 'outro' }],
});

test('observação inclui metadados de cache e gravações pendentes e devolve cancelamento', async () => {
  const contexto = await preparar();
  let recebido;
  assert.equal(contexto.observarDispensa('ro', (dados) => { recebido = dados; }), contexto.cancelamento);
  const { ref, opcoes, callback } = contexto.sdk.observacao;
  assert.equal(ref.path, 'ateliers/ro/dispensa');
  assert.deepEqual(opcoes, { includeMetadataChanges: true });
  callback({ docs: [contexto.documento('ing', { ...ingrediente, pendente: false, id: 'errado' }, true)],
    metadata: { fromCache: true } });
  assert.deepEqual(recebido, { itens: [{ ...ingrediente, id: 'ing', pendente: true }], doCache: true });
});

test('novo ingrediente retorna offline sem esperar commit e inclui autoria e datas', async () => {
  const contexto = await preparar();
  const resultado = await contexto.salvarIngrediente('ro', 'uid', ingrediente);
  assert.equal(resultado.id, 'novo-1');
  assert.equal(resultado.receitasAtualizadas, 0);
  assert.deepEqual(contexto.lotes[0].operacoes, [{
    tipo: 'set', ref: { id: 'novo-1', path: 'ateliers/ro/dispensa/novo-1' },
    dados: { ...ingrediente, criadoEm: 'timestamp-servidor', atualizadoEm: 'timestamp-servidor', atualizadoPor: 'uid' },
  }]);
  assert.equal(contexto.lotes.length, 1);
  contexto.pendentes[0].resolve();
  await resultado.sincronizado;
});

test('edição grava histórico no mesmo lote e sincronizado também espera a cascata', async () => {
  const contexto = await preparar({ anterior: { ...ingrediente, precoBase: 6, criadoEm: 'original' }, receitas: [receita('r')] });
  const resultado = await contexto.salvarIngrediente('ro', 'uid', ingrediente, 'ing');
  assert.equal(resultado.receitasAtualizadas, 1);
  assert.equal(contexto.lotes.length, 2);
  const [edicao, historico] = contexto.lotes[0].operacoes;
  assert.equal(edicao.tipo, 'update');
  assert.equal(edicao.dados.criadoEm, undefined);
  assert.equal(historico.ref.path, 'ateliers/ro/historicoPrecos/novo-1');
  assert.deepEqual(historico.dados, {
    ingredienteId: 'ing', nome: 'Açúcar',
    antes: { precoBase: 6, quantidadeBase: 500, unidadeBase: 'g' },
    depois: { precoBase: 12, quantidadeBase: 500, unidadeBase: 'g' },
    data: 'timestamp-servidor', atualizadoPor: 'uid',
  });
  contexto.pendentes[0].resolve();
  let sincronizou = false;
  resultado.sincronizado.then(() => { sincronizou = true; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(sincronizou, false);
  contexto.pendentes[1].resolve();
  await resultado.sincronizado;
});

test('renomear não gera histórico, mas ainda executa a cascata para vínculos existentes', async () => {
  const contexto = await preparar({ anterior: ingrediente, receitas: [receita('r')] });
  const resultado = await contexto.salvarIngrediente('ro', 'uid', { ...ingrediente, nome: 'Novo nome' }, 'ing');
  assert.equal(contexto.lotes[0].operacoes.length, 1);
  assert.equal(resultado.receitasAtualizadas, 0);
  assert.equal(contexto.lotes.length, 1);
  contexto.pendentes[0].resolve();
  await resultado.sincronizado;
});

test('falhas de sincronização do ingrediente e da cascata chegam à promessa da tela', async () => {
  const novo = await preparar();
  const cadastro = await novo.salvarIngrediente('ro', 'uid', ingrediente);
  novo.pendentes[0].reject(new Error('Sem permissão'));
  await assert.rejects(cadastro.sincronizado, /Sem permissão/);
});

test('exclusão e desfazer retornam offline e restauram exatamente os dados anteriores', async () => {
  const anterior = { ...ingrediente, criadoEm: 'original', campoExtra: 123 };
  const contexto = await preparar({ anterior });
  const resultado = await contexto.excluirIngrediente('ro', 'ing');
  assert.equal(contexto.lotes[0].operacoes[0].tipo, 'delete');
  const restauracao = resultado.restaurar();
  assert.deepEqual(contexto.lotes[1].operacoes[0], {
    tipo: 'set', ref: { id: 'ing', path: 'ateliers/ro/dispensa/ing' }, dados: anterior,
  });
  for (const promessa of contexto.pendentes) promessa.resolve();
  await Promise.all([resultado.sincronizado, restauracao.sincronizado]);
});

test('edição e exclusão de documento ausente não gravam', async () => {
  const contexto = await preparar();
  await assert.rejects(contexto.salvarIngrediente('ro', 'uid', ingrediente, 'ausente'), /não encontrado/);
  await assert.rejects(contexto.excluirIngrediente('ro', 'ausente'), /não encontrado/);
  assert.equal(contexto.pendentes.length, 0);
});

test('histórico filtra por ingrediente no servidor e ordena antes de limitar no cliente', async () => {
  const historico = [1, 3, 2, 4].map((valor) => ({ id: String(valor), data: { toMillis: () => valor } }));
  const contexto = await preparar({ historico });
  assert.deepEqual((await contexto.listarHistorico('ro', 'ing', 2)).map((item) => item.id), ['4', '3']);
  assert.deepEqual(contexto.consultas[0], {
    path: 'ateliers/ro/historicoPrecos', filtros: [['ingredienteId', '==', 'ing']],
  });
  assert.equal((await contexto.listarHistorico('ro', 'ing')).length, 4);
});

test('cascata vazia ou sem alterações não cria lote', async () => {
  for (const receitas of [[], [receita('r', false)]]) {
    const contexto = await preparar({ receitas });
    assert.equal(await contexto.aplicarCascata('ro', 'uid', { ...ingrediente, id: 'ing' }), 0);
    assert.equal(contexto.lotes.length, 0);
  }
});

test('cascata grava só alteradas em lotes de até 450, recalcula e preserva quantidade usada', async () => {
  const receitas = Array.from({ length: 451 }, (_, indice) => receita(`r${indice}`));
  receitas.splice(10, 0, receita('intocada', false));
  const contexto = await preparar({ receitas });
  assert.equal(await contexto.aplicarCascata('ro', 'uid', { ...ingrediente, id: 'ing' }), 451);
  assert.deepEqual(contexto.lotes.map((lote) => lote.operacoes.length), [450, 1]);
  assert.deepEqual(contexto.lotes.map((lote) => lote.commits), [1, 1]);
  for (const operacao of contexto.lotes.flatMap((lote) => lote.operacoes)) {
    assert.notEqual(operacao.ref.id, 'intocada');
    assert.equal(operacao.tipo, 'update');
    assert.equal(operacao.dados.atualizadoPor, 'uid');
    assert.equal(operacao.dados.atualizadoEm, 'timestamp-servidor');
    assert.equal(operacao.dados.ingredientes[0].quantidadeUsada, 100);
    assert.equal(operacao.dados.ingredientes[0].custoCalculado, 2.4);
    assert.equal(operacao.dados.campoPreservado, undefined);
    assert.ok(Math.abs(operacao.dados.precoSugerido - 6.24) < 1e-9);
  }
});

test('edicao sem mudanca nao grava', async () => {
  const contexto = await preparar({ anterior: ingrediente });
  const resultado = await contexto.salvarIngrediente('ro', 'uid', ingrediente, 'ing');
  assert.equal(resultado.id, 'ing');
  assert.equal(resultado.receitasAtualizadas, 0);
  assert.equal(contexto.lotes.length, 0);
  assert.equal(contexto.pendentes.length, 0);
  await resultado.sincronizado;
});

test('falha da cascata devolve zero sem lancar', async () => {
  const contexto = await preparar({
    anterior: { ...ingrediente, precoBase: 6 },
    getDocsErro: new Error('Sem cache'),
  });
  const erroOriginal = console.error;
  console.error = () => {};
  try {
    const resultado = await contexto.salvarIngrediente('ro', 'uid', ingrediente, 'ing');
    assert.equal(resultado.receitasAtualizadas, 0);
    assert.equal(contexto.lotes.length, 1);
    contexto.pendentes[0].resolve();
    await resultado.sincronizado;
  } finally {
    console.error = erroOriginal;
  }
});

test('falha ao ler exclusao devolve mensagem amigavel', async () => {
  const contexto = await preparar({ getDocErro: new Error('Offline') });
  await assert.rejects(
    contexto.excluirIngrediente('ro', 'ing'),
    /N\u00e3o foi poss\u00edvel excluir agora\. Tente de novo quando a internet voltar\./,
  );
  assert.equal(contexto.pendentes.length, 0);
});
