import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {FIREBASE_API_KEY,AUTHDOMAIN,PROJECTID, STORAGEBUCKET,MESSAGINGSENDERID, APPID} from "./config.js";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: AUTHDOMAIN,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDERID,
  appId: APPID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
