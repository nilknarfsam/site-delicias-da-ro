import {
  auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from '../firebase.js';

export function entrarComGoogle() {
  const provedor = new GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provedor);
}

export function sair() {
  return signOut(auth);
}

export function observarSessao(callback) {
  return onAuthStateChanged(auth, callback);
}
