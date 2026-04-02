// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC5tIc-RoRJtbnClU_MnI32EInB9O_x4Kk",
  authDomain: "modaflow-12445.firebaseapp.com",
  projectId: "modaflow-12445",
  storageBucket: "modaflow-12445.firebasestorage.app",
  messagingSenderId: "507314719318",
  appId: "1:507314719318:web:900b3e9883f245688149f7",
  measurementId: "G-P9247XNGY0",
  databaseURL: "https://modaflow-12445-default-rtdb.firebaseio.com/",
};

// Esto evita que se inicialice dos veces
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(app);

const database = getDatabase(app);
export const db = getFirestore(app);


export { app, auth, database };

