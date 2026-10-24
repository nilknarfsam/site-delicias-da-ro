import { db, collection, query, where, limit, getDocs } from '../firebase.js';

export async function buscarAtelieDoUsuario(uid) {
  const consulta = query(
    collection(db, 'ateliers'),
    where('membros.' + uid, 'in', ['dona', 'gestor']),
    limit(1),
  );
  const resultado = await getDocs(consulta);
  if (resultado.empty) return null;

  const atelie = resultado.docs[0];
  return { ...atelie.data(), id: atelie.id };
}

// Indica a conexão do navegador; não confirma sincronização com o Firestore.
export function observarConexao(callback) {
  const informar = () => callback({ online: navigator.onLine });
  window.addEventListener('online', informar);
  window.addEventListener('offline', informar);
  informar();

  return () => {
    window.removeEventListener('online', informar);
    window.removeEventListener('offline', informar);
  };
}
