import { initializeApp } from "firebase/app";

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

export { app, firebaseConfig };
export default app;
