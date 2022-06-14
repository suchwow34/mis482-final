// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJbqxI0eooRUQCCp7VAJpWan2zt0vrSao",
  authDomain: "such-wow-92a38.firebaseapp.com",
  projectId: "such-wow-92a38",
  storageBucket: "such-wow-92a38.appspot.com",
  messagingSenderId: "64389324795",
  appId: "1:64389324795:web:04d1d81e582bdf1d94755e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, { experimentalForceLongPolling: true });
export const auth = getAuth(app);