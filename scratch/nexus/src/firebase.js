import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwLSpHeqeQBgoUwOjNY4LOfxsqsyQMjws",
  authDomain: "nexsus-4455b.firebaseapp.com",
  projectId: "nexsus-4455b",
  storageBucket: "nexsus-4455b.firebasestorage.app",
  messagingSenderId: "1035885112553",
  appId: "1:1035885112553:web:5c48e085f375319126d478",
  measurementId: "G-P2DGNQY1W2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, firebaseConfig };
export default app;
