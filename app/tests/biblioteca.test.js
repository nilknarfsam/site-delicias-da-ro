import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lerReceitaJson, lerArquivoBiblioteca, resumirImportacao, nomeDeCopia, validarReceita,
  filtrarReceitas, listarCategorias, paraExportacao, paraRascunhoPrecificacao,
} from '../js/dominio/biblioteca.js';

// Dados fictícios, sem receitas ou custos reais do ateliê.
const exemplo = () => ({ nome: 'Exemplo fictício', ingredientes: [{ nome: 'Açúcar' }] });

test('JSON no estilo GPT aceita apelidos, vírgula e alternativas sem alterar a entrada', () => {
  const dados = {
    name: ' Exemplo GPT ', type: ' Teste ', recipeId: 'antigo', description: ' Descrição ',
    modo_preparo: ' Misturar ', observations: ' Notas ', source: ' Teste ',
    createdAt: '2026-01-02T00:00:00.000Z', localidadeReferencia: { city: ' Manaus ', state: ' AM ' },
    yield: '14 fatias', time: '20 minutos', difficulty: 'Fácil', author: 'Fictício',
    ingredients: [{ name: ' Açúcar ', medida: ' peso ', quantity: ' 2 xícaras ',
      quantityBase: '1000', quantityUsed: '1,5', unidadeUsada: ' g ',
      precoBaseEstimado: '9,25', estimado: true, group: 'Massa', note: ' Nota ',
      tipo_item: ' ALTERNATIVA ', grupo_alternativa: ' doce ' }],
  };
  const antes = structuredClone(dados);
  assert.deepEqual(lerReceitaJson(dados), {
    nome: 'Exemplo GPT', categoria: 'Teste', id: 'antigo', descricao: 'Descrição',
    modoPreparo: 'Misturar', observacoes: 'Notas', origem: 'Teste',
    dataCriacao: dados.createdAt, localidadeCidade: 'Manaus', localidadeEstado: 'AM',
    rendimento: '14 fatias', tempoPreparo: '20 minutos', dificuldade: 'Fácil', autor: 'Fictício',
    ingredientes: [{ nome: 'Açúcar', tipoMedida: 'peso', quantidadeOriginal: '2 xícaras',
      quantidadeBase: 1000, quantidadeUsada: 1.5, unidadeBase: 'g', unidadeUsada: 'g',
      precoBase: 9.25, precisaRevisao: true, grupo: 'Massa', observacao: 'Nota',
      tipoItem: 'alternativa', grupoAlternativa: 'doce' }],
  });
  assert.deepEqual(dados, antes);
});

test('todos os apelidos de texto da receita são aceitos e o primeiro não vazio vence', () => {
  const campos = {
    nome: ['nome', 'name', 'titulo'], categoria: ['categoria', 'type', 'tipo'],
    id: ['id', 'recipeId'], descricao: ['descricao', 'description', 'desc'],
    modoPreparo: ['modoPreparo', 'preparo', 'modo_preparo'],
    observacoes: ['observacoes', 'observations', 'notas'], origem: ['origem', 'source'],
    dataCriacao: ['dataCriacao', 'createdAt'], rendimento: ['rendimento', 'yield', 'porcoes'],
    tempoPreparo: ['tempoPreparo', 'tempo', 'tempo_preparo', 'time'],
    dificuldade: ['dificuldade', 'difficulty', 'nivel'], autor: ['autor', 'author', 'fonte'],
  };
  for (const [campo, apelidos] of Object.entries(campos)) {
    for (const apelido of apelidos) {
      const dados = { ...exemplo(), ...Object.fromEntries(apelidos.map((chave) => [chave, ' '])) };
      dados[apelido] = ' Valor ';
      assert.equal(lerReceitaJson(dados)[campo], 'Valor', apelido);
    }
    const dados = { ...exemplo(), ...Object.fromEntries(apelidos.map((chave) => [chave, 'Outro'])) };
    dados[apelidos[0]] = ' Primeiro ';
    assert.equal(lerReceitaJson(dados)[campo], 'Primeiro');
  }
});

test('apelidos dos ingredientes preservam zero e omitem valores vazios ou não numéricos', () => {
  const campos = {
    nome: ['nome', 'name'], tipoMedida: ['tipoMedida', 'tipo', 'medida'],
    quantidadeOriginal: ['quantidadeOriginal', 'quantidade', 'quantity'],
    unidadeBase: ['unidadeBase', 'unitBase', 'unidade', 'unidadeUsada'],
    unidadeUsada: ['unidadeUsada'], grupo: ['grupo', 'group', 'categoria'],
    observacao: ['observacao', 'observacoes', 'obs', 'note'],
    tipoItem: ['tipoItem', 'tipo_item', 'type'], grupoAlternativa: ['grupoAlternativa', 'grupo_alternativa'],
  };
  for (const [campo, apelidos] of Object.entries(campos)) {
    for (const apelido of apelidos) {
      const item = { nome: 'Teste', ...Object.fromEntries(apelidos.map((chave) => [chave, ' '])) };
      item[apelido] = ' valor ';
      assert.equal(lerReceitaJson({ ...exemplo(), ingredientes: [item] }).ingredientes[0][campo], 'valor');
    }
  }
  for (const apelido of ['precisaRevisao', 'estimado', 'precoEstimado']) {
    assert.equal(lerReceitaJson({ ...exemplo(), ingredientes: [{ nome: 'Teste', [apelido]: true }] })
      .ingredientes[0].precisaRevisao, true);
  }
  const receita = lerReceitaJson({ ...exemplo(), descricao: ' ', ingredientes: [{
    nome: 'Teste', precoBaseEstimado: ' ', priceBase: '0', quantityBase: '1,5',
    quantityUsed: '2,5', grupo: '', observacao: null, unidadeBase: '', quantidadeOriginal: ' ',
  }] });
  assert.deepEqual(receita.ingredientes[0], {
    nome: 'Teste', precoBase: 0, quantidadeBase: 1.5, quantidadeUsada: 2.5, precisaRevisao: false,
  });
  assert.equal('descricao' in receita, false);
});

test('leitura aceita receita, lista e backup antigo em texto ou objeto', () => {
  const receita = exemplo();
  const esperado = [lerReceitaJson(receita)];
  for (const dados of [receita, [receita], { libraryRecipes: [receita], version: 1, exportedAt: 'data' }]) {
    assert.deepEqual(lerArquivoBiblioteca(dados), { receitas: esperado, erros: [] });
    assert.deepEqual(lerArquivoBiblioteca(JSON.stringify(dados)), { receitas: esperado, erros: [] });
  }
  assert.deepEqual(lerArquivoBiblioteca([]), { receitas: [], erros: [] });
});

test('JSON inválido retorna erro geral e erros individuais preservam receitas válidas', () => {
  assert.deepEqual(lerArquivoBiblioteca('{'), {
    receitas: [], erros: [{ posicao: 0, mensagem: 'O texto não é um JSON válido.' }],
  });
  const resultado = lerArquivoBiblioteca([exemplo(), { ingredientes: [] }, exemplo(),
    { nome: 'Quebrada', ingredientes: [null] }]);
  assert.equal(resultado.receitas.length, 2);
  assert.deepEqual(resultado.erros.map(({ posicao, nome }) => ({ posicao, nome })), [
    { posicao: 2, nome: undefined }, { posicao: 4, nome: 'Quebrada' },
  ]);
  for (const dados of [null, 1, [], { nome: 'Teste' }, { nome: 'Teste', ingredientes: [] },
    { nome: 'Teste', ingredientes: ['a'] }, { nome: 'Teste', ingredientes: [{}] }]) {
    assert.throws(() => lerReceitaJson(dados), Error);
  }
  assert.equal(lerArquivoBiblioteca({ libraryRecipes: {} }).erros[0].posicao, 0);
});

test('resumo conta ingredientes e estimativas e mantém posições originais das duplicadas', () => {
  const resultado = lerArquivoBiblioteca([{}, { nome: ' acucar ', ingredientes: [
    { nome: 'Teste', estimado: true }, { nome: 'Outro' },
  ] }, exemplo()]);
  assert.deepEqual(resumirImportacao(resultado, [{ nome: 'Açúcar', id: 'existente' }]), {
    total: 2, ingredientes: 3, comPrecoEstimado: 1,
    duplicadas: [{ posicao: 2, nome: 'acucar', idExistente: 'existente' }],
  });
});

test('cópia encontra primeiro nome disponível com normalização', () => {
  assert.equal(nomeDeCopia(' Nome ', []), 'Nome (cópia)');
  assert.equal(nomeDeCopia('Nome', [{ nome: 'nome (cópia)' }]), 'Nome (cópia 2)');
  assert.equal(nomeDeCopia('Nome', [{ nome: 'Nome (cópia)' }, { nome: 'Nome (cópia 2)' }]), 'Nome (cópia 3)');
});

test('validação retorna erros por campo e índice sem alterar a receita', () => {
  assert.deepEqual(validarReceita(exemplo()), { valido: true, erros: {} });
  const resultado = validarReceita({ nome: ' ', ingredientes: [{ nome: ' ' }, { nome: 'Teste' }, null] });
  assert.equal(resultado.valido, false);
  assert.ok(resultado.erros.nome);
  assert.deepEqual(Object.keys(resultado.erros.ingrediente), ['0', '2']);
  assert.ok(validarReceita({ nome: 'Teste', ingredientes: [] }).erros.ingredientes);
});

test('busca sem acento alcança ingrediente, nome e categoria e ordena pt-BR', () => {
  const lista = [
    { nome: 'Z teste', categoria: 'Massas', ingredientes: [{ nome: 'Açúcar' }] },
    { nome: 'Á teste', categoria: 'Massas', ingredientes: [{ nome: 'Açúcar' }] },
    { nome: 'B teste', categoria: 'Doces', ingredientes: [] },
  ];
  const antes = structuredClone(lista);
  assert.deepEqual(filtrarReceitas(lista, 'acucar').map((item) => item.nome), ['Á teste', 'Z teste']);
  assert.equal(filtrarReceitas(lista, 'a teste').length, 1);
  assert.equal(filtrarReceitas(lista, 'doces').length, 1);
  assert.equal(filtrarReceitas(lista, '', 'Massas').length, 2);
  assert.equal(filtrarReceitas(lista, '', 'massas').length, 0);
  assert.deepEqual(listarCategorias([...lista, { categoria: ' ' }, {}]), ['Doces', 'Massas']);
  assert.deepEqual(lista, antes);
});

test('exportação compatível mantém id e localidade e permite ler de volta sem campos internos', () => {
  const receita = lerReceitaJson({ ...exemplo(), id: 'local', localidadeReferencia: {
    cidade: 'Manaus', estado: 'AM',
  }, dataCriacao: '2026-01-02T00:00:00.000Z', rendimento: '14 fatias' });
  const backup = paraExportacao([{ ...receita, criadoEm: 'interno', atualizadoEm: 'interno',
    atualizadoPor: 'uid', pendente: true, campoExtra: 'interno' }]);
  assert.equal(backup.version, 1);
  assert.ok(Number.isFinite(Date.parse(backup.exportedAt)));
  assert.deepEqual(backup.libraryRecipes[0].localidadeReferencia, { cidade: 'Manaus', estado: 'AM' });
  assert.equal(backup.libraryRecipes[0].id, 'local');
  for (const campo of ['criadoEm', 'atualizadoEm', 'atualizadoPor', 'pendente', 'campoExtra', 'localidadeCidade']) {
    assert.equal(campo in backup.libraryRecipes[0], false);
  }
  assert.deepEqual(lerArquivoBiblioteca(JSON.stringify(backup)), { receitas: [receita], erros: [] });
});

test('exportação converte Timestamp ou Date para ISO e usa criadoEm quando necessário', () => {
  const data = new Date('2026-01-02T00:00:00.000Z');
  for (const campos of [{ dataCriacao: data }, { dataCriacao: { toDate: () => data } },
    { criadoEm: { toDate: () => data } }]) {
    assert.equal(paraExportacao([{ ...exemplo(), ...campos }]).libraryRecipes[0].dataCriacao, data.toISOString());
  }
});

test('rascunho usa dados da Dispensa, preserva quantidade e não altera Biblioteca ou Dispensa', () => {
  const receita = lerReceitaJson({ ...exemplo(), id: 'biblioteca', categoria: 'Teste',
    descricao: 'Descrição', modoPreparo: 'Misturar', rendimento: '14 fatias', ingredientes: [{
      nome: 'acucar', precoBase: 3, quantidadeBase: 50, quantidadeUsada: 12, unidadeBase: 'un',
      tipoMedida: 'unidade', grupoAlternativa: 'doce', precisaRevisao: true,
    }] });
  const dispensa = [{ id: 'dispensa', nome: 'Açúcar', precoBase: 9, quantidadeBase: 1000,
    unidadeBase: 'g', tipoMedida: 'peso' }];
  const antes = structuredClone({ receita, dispensa });
  assert.deepEqual(paraRascunhoPrecificacao(receita, dispensa), {
    nome: receita.nome, categoria: 'Teste', descricao: 'Descrição', modoPreparo: 'Misturar',
    ingredientes: [{ nome: 'acucar', precoBase: 9, quantidadeBase: 1000, quantidadeUsada: 12,
      unidadeBase: 'g', tipoMedida: 'peso', grupoAlternativa: 'doce', precisaRevisao: true,
      pantryIngredientId: 'dispensa' }],
    custosAdicionais: [], custosIndiretos: [], isPrecified: false, vezesAcessada: 0,
    origemBibliotecaId: 'biblioteca', rendimentoQuantidade: 14, rendimentoTipo: 'fatias',
  });
  assert.deepEqual({ receita, dispensa }, antes);
});

test('rascunho sem vínculo usa JSON ou padrões e só extrai rendimento iniciado por número', () => {
  const receita = lerReceitaJson({ ...exemplo(), ingredientes: [{ nome: 'Teste', precoBase: 4,
    quantidadeBase: 20, quantidadeUsada: 2, unidadeBase: 'ml', tipoMedida: 'peso' }] });
  assert.deepEqual(paraRascunhoPrecificacao(receita, []).ingredientes, receita.ingredientes);
  const padrao = paraRascunhoPrecificacao({ ...lerReceitaJson(exemplo()), rendimento: 'uma forma' }, []);
  assert.deepEqual(padrao.ingredientes[0], {
    nome: 'Açúcar', tipoMedida: 'peso', precoBase: 0, quantidadeBase: 0,
    quantidadeUsada: 0, unidadeBase: 'g', precisaRevisao: false,
  });
  assert.equal('rendimentoQuantidade' in padrao, false);
  assert.equal('rendimentoTipo' in padrao, false);
  assert.equal(paraRascunhoPrecificacao({ ...receita, rendimento: '1,5 kg' }, []).rendimentoQuantidade, 1.5);
});
