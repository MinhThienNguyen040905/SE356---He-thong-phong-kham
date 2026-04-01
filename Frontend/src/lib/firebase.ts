import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyBaFW0sNAgrO-agT8FtEqeNGKh-pyNksNM",
  authDomain: "heathcare-b42b7.firebaseapp.com",
  projectId: "heathcare-b42b7",
  storageBucket: "heathcare-b42b7.firebasestorage.app",
  messagingSenderId: "770518473138",
  appId: "1:770518473138:web:888acca71f8124f3936cab",
  measurementId: "G-F6V3KR4XRW"
};


const app = initializeApp(firebaseConfig)


export const auth = getAuth(app)
export const db = getFirestore(app)
export default app