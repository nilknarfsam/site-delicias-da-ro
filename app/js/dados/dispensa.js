import {
  db, collection, doc, getDoc, getDocs, onSnapshot, query, where, writeBatch, serverTimestamp,
} from '../firebase.js';
import { mudouPreco } from '../dominio/dispensa.js';
import { aplicarCascata } from './cascata-dispensa.js';

export function observarDispensa(atelierId, callback) {
  return onSnapshot(collection(db, 'ateliers', atelierId, 'dispensa'),
    { includeMetadataChanges: true }, (snapshot) => callback({
      itens: snapshot.docs.map((item) => ({
        ...item.data(), id: item.id, pendente: item.metadata.hasPendingWrites,
      })),
      doCache: snapshot.metadata.fromCache,
    }));
}

function camposPreco(dados) {
  const { precoBase, quantidadeBase, unidadeBase } = dados;
  return { precoBase, quantidadeBase, unidadeBase };
}

function camposIguais(anterior, dados) {
  return ['nome', 'precoBase', 'quantidadeBase', 'unidadeBase', 'tipoMedida']
    .every((campo) => anterior[campo] === dados[campo]);
}

export async function salvarIngrediente(atelierId, uid, dados, idExistente = null) {
  const colecao = collection(db, 'ateliers', atelierId, 'dispensa');
  const referencia = idExistente == null ? doc(colecao) : doc(colecao, idExistente);
  const registro = { ...dados, atualizadoEm: serverTimestamp(), atualizadoPor: uid };
  let lote;
  let mudouPrecoIngrediente = false;
  if (idExistente == null) {
    lote = writeBatch(db);
    lote.set(referencia, { ...registro, criadoEm: serverTimestamp() });
  } else {
    const anterior = await getDoc(referencia);
    if (!anterior.exists()) throw new Error('Ingrediente não encontrado.');
    const dadosAnteriores = anterior.data();
    if (camposIguais(dadosAnteriores, dados)) {
      return { id: referencia.id, receitasAtualizadas: 0, sincronizado: Promise.resolve() };
    }
    lote = writeBatch(db);
    lote.update(referencia, registro);
    mudouPrecoIngrediente = mudouPreco(dadosAnteriores, dados);
    if (mudouPrecoIngrediente) {
      lote.set(doc(collection(db, 'ateliers', atelierId, 'historicoPrecos')), {
        ingredienteId: referencia.id,
        nome: dados.nome,
        antes: camposPreco(dadosAnteriores),
        depois: camposPreco(dados),
        data: serverTimestamp(),
        atualizadoPor: uid,
      });
    }
  }

  const sincronizacoes = [];
  const acompanhar = (promessa) => {
    // Marca a rejeição como observada enquanto a leitura da cascata ainda está em andamento.
    promessa.catch(() => {});
    sincronizacoes.push(promessa);
  };
  acompanhar(lote.commit());
  let receitasAtualizadas = 0;
  if (mudouPrecoIngrediente) {
    try {
      receitasAtualizadas = await aplicarCascata(
        atelierId, uid, { ...dados, id: referencia.id }, acompanhar,
      );
    } catch (erro) {
      console.error('Não foi possível aplicar a cascata da Dispensa.', erro);
      receitasAtualizadas = 0;
    }
  }
  const sincronizado = Promise.all(sincronizacoes).then(() => undefined);
  sincronizado.catch(() => {});
  return { id: referencia.id, receitasAtualizadas, sincronizado };
}

export async function excluirIngrediente(atelierId, id) {
  const referencia = doc(db, 'ateliers', atelierId, 'dispensa', id);
  let anterior;
  try {
    anterior = await getDoc(referencia);
  } catch {
    throw new Error('Não foi possível excluir agora. Tente de novo quando a internet voltar.');
  }
  if (!anterior.exists()) throw new Error('Ingrediente não encontrado.');
  const dados = anterior.data();
  const lote = writeBatch(db);
  lote.delete(referencia);
  const sincronizado = lote.commit();
  sincronizado.catch(() => {});
  return {
    sincronizado,
    restaurar() {
      const restauracao = writeBatch(db);
      restauracao.set(referencia, dados);
      const sincronizado = restauracao.commit();
      sincronizado.catch(() => {});
      return { sincronizado };
    },
  };
}

function instante(data) {
  return data?.toMillis?.() ?? 0;
}

export async function listarHistorico(atelierId, ingredienteId, limite = 10) {
  const consulta = query(collection(db, 'ateliers', atelierId, 'historicoPrecos'),
    where('ingredienteId', '==', ingredienteId));
  const snapshot = await getDocs(consulta);
  // Filtrar no servidor e ordenar antes de limitar evita exigir índice composto.
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))
    .sort((a, b) => instante(b.data) - instante(a.data))
    .slice(0, limite);
}
