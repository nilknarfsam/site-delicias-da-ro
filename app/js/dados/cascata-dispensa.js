import { db, collection, getDocs, writeBatch, serverTimestamp } from '../firebase.js';
import { aplicarCascataDaDispensa } from '../dominio/cascata.js';

function acompanharGravacao(promessa) {
  promessa.catch((erro) => console.error('Não foi possível sincronizar a cascata da Dispensa.', erro));
}

// O observador opcional permite ao salvamento reunir os commits sem aguardá-los offline.
export async function aplicarCascata(atelierId, uid, ingrediente, aoGravar = acompanharGravacao) {
  const snapshot = await getDocs(collection(db, 'ateliers', atelierId, 'precificacoes'));
  if (snapshot.empty) return 0;

  const receitas = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
  const resultado = aplicarCascataDaDispensa(ingrediente, receitas);
  let lote;
  let quantidade = 0;
  resultado.receitas.forEach((receita, indice) => {
    if (receita === receitas[indice]) return;
    if (quantidade === 0) lote = writeBatch(db);
    // Atualizar só os campos da cascata preserva os demais dados do documento.
    lote.update(snapshot.docs[indice].ref, {
      ingredientes: receita.ingredientes,
      custoTotal: receita.custoTotal,
      precoSugerido: receita.precoSugerido,
      dataAtualizacao: receita.dataAtualizacao,
      atualizadoEm: serverTimestamp(),
      atualizadoPor: uid,
    });
    quantidade += 1;
    if (quantidade === 450) {
      aoGravar(lote.commit());
      quantidade = 0;
    }
  });
  if (quantidade > 0) aoGravar(lote.commit());
  return resultado.atualizadas;
}
