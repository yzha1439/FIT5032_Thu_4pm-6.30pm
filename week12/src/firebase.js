import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDji80k7M6utKBUcvz_Bxgb414QQC5vJkI',
  authDomain: 'fit5032-2a96c.firebaseapp.com',
  projectId: 'fit5032-2a96c',
  storageBucket: 'fit5032-2a96c.firebasestorage.app',
  messagingSenderId: '96820874755',
  appId: '1:96820874755:web:cdd0c45528b3b464668836',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

if (
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'
) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}