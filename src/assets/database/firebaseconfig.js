// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3ks-W0h7ZEsK1ot9Bof5Bac5-p1fkGN8",
  authDomain: "practicajulio-7170e.firebaseapp.com",
  projectId: "practicajulio-7170e",
  storageBucket: "practicajulio-7170e.firebasestorage.app",
  messagingSenderId: "384306764514",
  appId: "1:384306764514:web:df53509a7346f43448dcbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);