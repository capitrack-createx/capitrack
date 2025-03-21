// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { Auth, getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzoOXZwHUtcboDHUwq--rvgA2Zx9UR-tg",
  authDomain: "createx-8.firebaseapp.com",
  projectId: "createx-8",
  storageBucket: "createx-8.firebasestorage.app",
  messagingSenderId: "404251690411",
  appId: "1:404251690411:web:9372805f8d2f6a2e0e3eee",
  measurementId: "G-J58TV8R82M"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export default app;
