// Import depuis le CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpYJDqmenBsPzchE9P5w_2Ir_mAeAgwYo",
  authDomain: "freezyflix-31913.firebaseapp.com",
  projectId: "freezyflix-31913",
  storageBucket: "freezyflix-31913.appspot.com",
  messagingSenderId: "641222658736",
  appId: "1:641222658736:web:ba4461fbc244d33f070975"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, signInWithPopup, signOut, db };
