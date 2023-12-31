import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "@firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsQse1mKxQ1F7-l41RE1Oz4QhP91qgmLw",
  authDomain: "clubbox-system.firebaseapp.com",
  projectId: "clubbox-system",
  storageBucket: "clubbox-system.appspot.com",
  messagingSenderId: "359955007424",
  appId: "1:359955007424:web:67ba150aad7d439d6eea25",
  measurementId: "G-D9WWVVXX7W",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
