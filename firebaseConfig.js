// firebaseConfig.js (Yeh poora code paste karo)

// 1. Sirf zaroori cheezein import karo
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 2. YEH AAPKA CONFIG HAI (Sirf ek baar)
const firebaseConfig = {
  apiKey: "AIzaSyCEO9-9tOLVxTJz3WSXCFA5lQwaJbyLB50",
  authDomain: "my-cloth-531d3.firebaseapp.com",
  projectId: "my-cloth-531d3",
  storageBucket: "my-cloth-531d3.firebasestorage.app",
  messagingSenderId: "823324600458",
  appId: "1:823324600458:web:4e708a60a3fb5a37206573",
  measurementId: "G-VFL6MYBS4T"
};

// 3. App ko sirf EK BAAR initialize karo
const app = initializeApp(firebaseConfig);

// 4. Auth aur DB ko export karo (yahaan 'app' aayega)
export const auth = getAuth(app);
export const db = getFirestore(app);