import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4C2Mp-0-2m_0OIADuqZ2G8eFxM1HvPac",
  authDomain: "flotta-cd-gemona-del-fri-8b8e9.firebaseapp.com",
  projectId: "flotta-cd-gemona-del-fri-8b8e9",
  storageBucket: "flotta-cd-gemona-del-fri-8b8e9.firebasestorage.app",
  messagingSenderId: "886411162172",
  appId: "1:886411162172:web:52eda305bd1218b53a0939"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
