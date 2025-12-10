// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpYJDqmenBsPzchE9P5w_2Ir_mAeAgwYo",
  authDomain: "freezyflix-31913.firebaseapp.com",
  databaseURL: "https://freezyflix-31913-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "freezyflix-31913",
  storageBucket: "freezyflix-31913.appspot.com",
  messagingSenderId: "641222658736",
  appId: "1:641222658736:web:ba4461fbc244d33f070975"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, set, createUserWithEmailAndPassword };
