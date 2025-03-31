import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase aquí
const firebaseconfig = {
  apiKey: "AIzaSyA3ks-W0h7ZEsK1ot9Bof5Bac5-p1fkGN8",
  authDomain: "practicajulio-7170e.firebaseapp.com",
  projectId: "practicajulio-7170e",
  storageBucket: "practicajulio-7170e.firebasestorage.app",
  messagingSenderId: "384306764514",
  appId: "1:384306764514:web:df53509a7346f43448dcbb"
};

  const appfirebase = initializeApp(firebaseconfig);

  const storage = getStorage(appfirebase);

  const db = getFirestore(appfirebase);

  const auth = getAuth(appfirebase);

  export {appfirebase,db,auth, storage};