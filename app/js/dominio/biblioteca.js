import { normalizarIngrediente } from './normalizar.js';
import { chaveBusca } from './dispensa.js';

function objeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function primeiro(dados, campos) {
  for (const campo of campos) {
    const valor = dados[campo];
    if (valor == null || (typeof valor === 'string' && !valor.trim())) continue;
    return typeof valor === 'string' ? valor.trim() : valor;
  }
}

function textos(destino, dados, campos) {
  for (const [campo, apelidos] of Object.entries(campos)) {
    const valor = primeiro(dados, apelidos);
    if (typeof valor === 'string' || typeof valor === 'number') destino[campo] = String(valor);
  }
}

function lerIngrediente(dados, indice) {
  if (!objeto(dados)) throw new Error(`O ingrediente ${indice + 1} deve ser um objeto.`);
  const ingrediente = {};
  textos(ingrediente, dados, {
    nome: ['nome', 'name'], tipoMedida: ['tipoMedida', 'tipo', 'medida'],
    quantidadeOriginal: ['quantidadeOriginal', 'quantidade', 'quantity'],
    unidadeBase: ['unidadeBase', 'unitBase', 'unidade', 'unidadeUsada'],
    unidadeUsada: ['unidadeUsada'], grupo: ['grupo', 'group', 'categoria'],
    observacao: ['observacao', 'observacoes', 'obs', 'note'],
    tipoItem: ['tipoItem', 'tipo_item', 'type'],
    grupoAlternativa: ['grupoAlternativa', 'grupo_alternativa'],
  });
  if (!ingrediente.nome) throw new Error(`Informe o nome do ingrediente ${indice + 1}.`);
  if (ingrediente.tipoItem) ingrediente.tipoItem = ingrediente.tipoItem.toLowerCase();
  for (const [campo, apelidos] of Object.entries({
    quantidadeBase: ['quantidadeBase', 'quantityBase'],
    quantidadeUsada: ['quantidadeUsada', 'quantityUsed'],
    precoBase: ['precoBaseEstimado', 'precoBase', 'priceBase'],
  })) {
    const valor = primeiro(dados, apelidos);
    if (typeof valor !== 'number' && typeof valor !== 'string') continue;
    const numero = Number(String(valor).replace(',', '.'));
    if (Number.isFinite(numero)) ingrediente[campo] = numero;
  }
  ingrediente.precisaRevisao = dados.precisaRevisao === true
    || dados.estimado === true || dados.precoEstimado === true;
  return ingrediente;
}

export function lerReceitaJson(dados) {
  if (!objeto(dados)) throw new Error('A receita deve ser um objeto.');
  const receita = {};
  textos(receita, dados, {
    nome: ['nome', 'name', 'titulo'], categoria: ['categoria', 'type', 'tipo'],
    id: ['id', 'recipeId'], descricao: ['descricao', 'description', 'desc'],
    modoPreparo: ['modoPreparo', 'preparo', 'modo_preparo'],
    observacoes: ['observacoes', 'observations', 'notas'], origem: ['origem', 'source'],
    dataCriacao: ['dataCriacao', 'createdAt'], rendimento: ['rendimento', 'yield', 'porcoes'],
    tempoPreparo: ['tempoPreparo', 'tempo', 'tempo_preparo', 'time'],
    dificuldade: ['dificuldade', 'difficulty', 'nivel'], autor: ['autor', 'author', 'fonte'],
  });
  if (!receita.nome) throw new Error('Informe o nome da receita.');
  if (objeto(dados.localidadeReferencia)) {
    textos(receita, dados.localidadeReferencia, {
      localidadeCidade: ['cidade', 'city'], localidadeEstado: ['estado', 'state'],
    });
  }
  // O formulário e o Firestore usam a localidade achatada.
  textos(receita, receita.localidadeCidade ? {} : dados, { localidadeCidade: ['localidadeCidade'] });
  textos(receita, receita.localidadeEstado ? {} : dados, { localidadeEstado: ['localidadeEstado'] });
  const ingredientes = primeiro(dados, ['ingredientes', 'ingredients']);
  if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
    throw new Error('Informe uma lista com ao menos um ingrediente.');
  }
  receita.ingredientes = ingredientes.map(lerIngrediente);
  return receita;
}

export function lerArquivoBiblioteca(textoOuObjeto) {
  let dados = textoOuObjeto;
  if (typeof dados === 'string') {
    try {
      dados = JSON.parse(dados);
    } catch {
      return { receitas: [], erros: [{ posicao: 0, mensagem: 'O texto não é um JSON válido.' }] };
    }
  }
  if (objeto(dados) && 'libraryRecipes' in dados) {
    if (!Array.isArray(dados.libraryRecipes)) {
      return { receitas: [], erros: [{ posicao: 0, mensagem: 'O backup deve conter uma lista de receitas.' }] };
    }
    dados = dados.libraryRecipes;
  }
  const receitas = [];
  const erros = [];
  (Array.isArray(dados) ? dados : [dados]).forEach((item, indice) => {
    try {
      receitas.push(lerReceitaJson(item));
    } catch (erro) {
      const nome = objeto(item) ? primeiro(item, ['nome', 'name', 'titulo']) : undefined;
      erros.push({ posicao: indice + 1, ...(nome ? { nome } : {}), mensagem: erro.message });
    }
  });
  return { receitas, erros };
}

export function resumirImportacao(resultado, existentes) {
  const duplicadas = [];
  let ingredientes = 0;
  let comPrecoEstimado = 0;
  let posicao = 0;
  const invalidas = new Set(resultado.erros.map((erro) => erro.posicao));
  for (const receita of resultado.receitas) {
    do { posicao += 1; } while (invalidas.has(posicao));
    ingredientes += receita.ingredientes.length;
    comPrecoEstimado += receita.ingredientes.filter((item) => item.precisaRevisao === true).length;
    const existente = existentes.find((item) =>
      normalizarIngrediente(item.nome) === normalizarIngrediente(receita.nome));
    if (existente) duplicadas.push({ posicao, nome: receita.nome, idExistente: existente.id });
  }
  return { total: resultado.receitas.length, ingredientes, comPrecoEstimado, duplicadas };
}

export function nomeDeCopia(nome, existentes) {
  const nomes = new Set(existentes.map((item) => normalizarIngrediente(item.nome)));
  let numero = 1;
  let copia;
  do {
    copia = `${nome.trim()} (cópia${numero === 1 ? '' : ` ${numero}`})`;
    numero += 1;
  } while (nomes.has(normalizarIngrediente(copia)));
  return copia;
}

export function validarReceita(receita) {
  const erros = {};
  if (!String(receita?.nome ?? '').trim()) erros.nome = 'Informe o nome da receita.';
  if (!Array.isArray(receita?.ingredientes) || receita.ingredientes.length === 0) {
    erros.ingredientes = 'Adicione ao menos um ingrediente com nome.';
  } else {
    const ingrediente = {};
    receita.ingredientes.forEach((item, indice) => {
      if (!String(item?.nome ?? '').trim()) ingrediente[indice] = { nome: 'Informe o nome do ingrediente.' };
    });
    if (Object.keys(ingrediente).length) erros.ingrediente = ingrediente;
  }
  return { valido: Object.keys(erros).length === 0, erros };
}

export function filtrarReceitas(lista, termo, categoria) {
  const busca = chaveBusca(termo);
  return lista.filter((receita) => (!categoria || receita.categoria === categoria)
    && [receita.nome, receita.categoria, ...(receita.ingredientes ?? []).map((item) => item.nome)]
      .some((texto) => chaveBusca(texto).includes(busca)))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function listarCategorias(lista) {
  return [...new Set(lista.map((receita) => receita.categoria).filter((categoria) => categoria?.trim()))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function paraExportacao(receitas) {
  return {
    libraryRecipes: receitas.map((item) => {
      const data = item.dataCriacao ?? item.criadoEm;
      const dataCriacao = data?.toDate?.().toISOString() ?? (data instanceof Date ? data.toISOString() : data);
      const receita = lerReceitaJson({ ...item, dataCriacao });
      const { localidadeCidade, localidadeEstado, ...campos } = receita;
      return {
        ...campos,
        localidadeReferencia: {
          ...(localidadeCidade ? { cidade: localidadeCidade } : {}),
          ...(localidadeEstado ? { estado: localidadeEstado } : {}),
        },
      };
    }),
    exportedAt: new Date().toISOString(), version: 1,
  };
}

export function paraRascunhoPrecificacao(receita, dispensa = []) {
  const rascunho = {
    nome: receita.nome, categoria: receita.categoria ?? '',
    ...(receita.descricao ? { descricao: receita.descricao } : {}),
    ...(receita.modoPreparo ? { modoPreparo: receita.modoPreparo } : {}),
    ingredientes: receita.ingredientes.map((item) => {
      const vinculado = dispensa.find((ingrediente) =>
        normalizarIngrediente(ingrediente.nome) === normalizarIngrediente(item.nome));
      const base = vinculado ?? item;
      return {
        nome: item.nome, tipoMedida: base.tipoMedida ?? 'peso',
        precoBase: base.precoBase ?? 0, quantidadeBase: base.quantidadeBase ?? 0,
        quantidadeUsada: item.quantidadeUsada ?? 0, unidadeBase: base.unidadeBase ?? 'g',
        ...(item.grupoAlternativa ? { grupoAlternativa: item.grupoAlternativa } : {}),
        precisaRevisao: item.precisaRevisao === true,
        ...(vinculado ? { pantryIngredientId: vinculado.id } : {}),
      };
    }),
    custosAdicionais: [], custosIndiretos: [], isPrecified: false, vezesAcessada: 0,
    ...(receita.id ? { origemBibliotecaId: receita.id } : {}),
  };
  const rendimento = String(receita.rendimento ?? '').trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (rendimento) {
    rascunho.rendimentoQuantidade = Number(rendimento[1].replace(',', '.'));
    rascunho.rendimentoTipo = rendimento[2].trim();
  }
  return rascunho;
}
