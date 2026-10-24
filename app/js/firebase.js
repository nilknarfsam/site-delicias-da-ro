import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

// VERSAO_SDK = '12.19.0': manter todos os imports do SDK neste arquivo.
export { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
export {
  doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, limit, getDocs,
  onSnapshot, writeBatch, deleteField,
}
  from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

export const app = initializeApp({
  apiKey: 'AIzaSyC4Q04EBT8D0i3DMLmVRlbXADR4wKVMAro',
  authDomain: 'delicias-da-ro-ab7e2.firebaseapp.com',
  projectId: 'delicias-da-ro-ab7e2',
  storageBucket: 'delicias-da-ro-ab7e2.firebasestorage.app',
  messagingSenderId: '1008116251130',
  appId: '1:1008116251130:web:b83f825a515baf84668c43',
});

export const auth = getAuth(app);

let banco;
try {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB indisponível neste navegador.');
  }
  banco = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch (erro) {
  console.warn('Cache persistente indisponível. Os dados ficarão apenas na memória.', erro);
  banco = getFirestore(app);
}

export const db = banco;
