import {
  db, collection, doc, getDoc, onSnapshot, writeBatch, serverTimestamp, deleteField,
} from '../firebase.js';
import { lerReceitaJson } from '../dominio/biblioteca.js';

export function observarBiblioteca(atelierId, callback) {
  return onSnapshot(collection(db, 'ateliers', atelierId, 'biblioteca'),
    { includeMetadataChanges: true }, (snapshot) => callback({
      itens: snapshot.docs.map((item) => ({
        ...item.data(), id: item.id, pendente: item.metadata.hasPendingWrites,
      })),
      doCache: snapshot.metadata.fromCache,
    }));
}

function registroReceita(receita, uid) {
  // Só os campos da entidade são persistidos; ids importados nunca viram ids locais.
  const { id, ...campos } = lerReceitaJson(receita);
  return { ...campos, atualizadoEm: serverTimestamp(), atualizadoPor: uid };
}

function acompanhar(promessa) {
  promessa.catch(() => {});
  return promessa;
}

export function salvarReceita(atelierId, uid, receita, idExistente = null) {
  const colecao = collection(db, 'ateliers', atelierId, 'biblioteca');
  const referencia = idExistente == null ? doc(colecao) : doc(colecao, idExistente);
  const registro = registroReceita(receita, uid);
  const lote = writeBatch(db);
  if (idExistente == null) {
    lote.set(referencia, { ...registro, criadoEm: serverTimestamp() });
  } else {
    // Campos apagados no formulário também precisam sair do documento existente.
    for (const campo of ['categoria', 'descricao', 'modoPreparo', 'observacoes', 'origem',
      'dataCriacao', 'localidadeCidade', 'localidadeEstado', 'rendimento', 'tempoPreparo',
      'dificuldade', 'autor']) {
      if (!(campo in registro)) registro[campo] = deleteField();
    }
    lote.update(referencia, registro);
  }
  return { id: referencia.id, sincronizado: acompanhar(lote.commit()) };
}

export async function excluirReceita(atelierId, id) {
  const referencia = doc(db, 'ateliers', atelierId, 'biblioteca', id);
  let anterior;
  try {
    anterior = await getDoc(referencia);
  } catch {
    throw new Error('Não foi possível excluir agora. Tente de novo quando a internet voltar.');
  }
  if (!anterior.exists()) throw new Error('Receita não encontrada.');
  const dados = anterior.data();
  const lote = writeBatch(db);
  lote.delete(referencia);
  return {
    sincronizado: acompanhar(lote.commit()),
    restaurar() {
      const restauracao = writeBatch(db);
      restauracao.set(referencia, dados);
      return { sincronizado: acompanhar(restauracao.commit()) };
    },
  };
}

function gravarLotes(itens, escrever) {
  const promessas = [];
  for (let inicio = 0; inicio < itens.length; inicio += 450) {
    const lote = writeBatch(db);
    itens.slice(inicio, inicio + 450).forEach((item) => escrever(lote, item));
    promessas.push(acompanhar(lote.commit()));
  }
  return acompanhar(Promise.all(promessas).then(() => undefined));
}

export function importarReceitas(atelierId, uid, receitas) {
  const colecao = collection(db, 'ateliers', atelierId, 'biblioteca');
  // Valida todas antes de enfileirar o primeiro lote.
  const registros = receitas.map((receita) => ({
    ...registroReceita(receita, uid), criadoEm: serverTimestamp(),
  }));
  const sincronizado = gravarLotes(registros, (lote, registro) => lote.set(doc(colecao), registro));
  return { quantidade: registros.length, sincronizado };
}

export function limparBiblioteca(atelierId, ids) {
  // A tela confirma a ação e baixa o backup antes de chamar este repositório.
  const sincronizado = gravarLotes(ids, (lote, id) =>
    lote.delete(doc(db, 'ateliers', atelierId, 'biblioteca', id)));
  return { quantidade: ids.length, sincronizado };
}
