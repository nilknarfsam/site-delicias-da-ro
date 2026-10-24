import { db, doc, getDoc, setDoc, updateDoc, serverTimestamp } from '../firebase.js';

export async function garantirUsuario(user) {
  const referencia = doc(db, 'usuarios', user.uid);
  const usuario = await getDoc(referencia);
  const dados = {
    nome: user.displayName ?? '',
    email: user.email ?? '',
    atualizadoEm: serverTimestamp(),
  };

  if (usuario.exists()) {
    await updateDoc(referencia, dados);
  } else {
    await setDoc(referencia, { ...dados, criadoEm: serverTimestamp() });
  }
}
