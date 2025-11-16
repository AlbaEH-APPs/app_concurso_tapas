import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4S97KFl2G7Rog9LdSNp06iDrzJvgdvbs",
  authDomain: "concurso-de-tapas.firebaseapp.com",
  projectId: "concurso-de-tapas",
  storageBucket: "concurso-de-tapas.firebasestorage.app",
  messagingSenderId: "338153988544",
  appId: "1:338153988544:web:d482906e3edbfb46b5e825"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
