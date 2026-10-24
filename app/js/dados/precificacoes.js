import { db, collection, doc, writeBatch, serverTimestamp } from '../firebase.js';
import { paraRascunhoPrecificacao } from '../dominio/biblioteca.js';

export function criarRascunhoDaReceita(atelierId, uid, receita, dispensa) {
  const referencia = doc(collection(db, 'ateliers', atelierId, 'precificacoes'));
  const rascunho = paraRascunhoPrecificacao(receita, dispensa);
  const lote = writeBatch(db);
  lote.set(referencia, {
    ...rascunho, dataCriacao: serverTimestamp(), dataAtualizacao: serverTimestamp(),
    atualizadoPor: uid,
  });
  const sincronizado = lote.commit();
  sincronizado.catch(() => {});
  return { id: referencia.id, sincronizado };
}
