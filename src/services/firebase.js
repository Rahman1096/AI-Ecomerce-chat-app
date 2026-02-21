import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRE3zrsupPSYZFa5P_7utTZnb81iunnqE",
  authDomain: "ai-controlled-store.firebaseapp.com",
  projectId: "ai-controlled-store",
  storageBucket: "ai-controlled-store.firebasestorage.app",
  messagingSenderId: "847014473261",
  appId: "1:847014473261:web:3610aeb181a5b4905892a4",
  measurementId: "G-010SBMGQFL",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
