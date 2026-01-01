import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// --- Configuration Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBpYJDqmenBsPzchE9P5w_2Ir_mAeAgwYo",
  authDomain: "freezyflix-31913.firebaseapp.com",
  projectId: "freezyflix-31913",
  storageBucket: "freezyflix-31913.appspot.com",
  messagingSenderId: "641222658736",
  appId: "1:641222658736:web:ba4461fbc244d33f070975"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// --- FORMULAIRE ---
const requestForm = document.getElementById("requestForm");
const categorieSelect = document.getElementById("categorie");
const seriesOptions = document.getElementById("seriesOptions");
const episodeWrapper = document.getElementById("episodeWrapper");
const toast = document.getElementById("toast");

// --- Affichage dynamique des champs séries ---
categorieSelect.addEventListener("change", () => {
  const isSeries = categorieSelect.value === "series";
  seriesOptions.classList.toggle("active", isSeries);
  episodeWrapper.classList.toggle("active", isSeries);
  clearError(categorieSelect);
});

// --- Effacer les erreurs à la saisie ---
["categorie", "titre", "url", "saison", "episode", "resolution"].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => clearError(input));
});

// --- Toast ---
function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

// --- Gestion des erreurs ---
function clearError(input) {
  const span = input.nextElementSibling;
  span.textContent = "";
  span.classList.remove("active");
}

function setError(input, message) {
  const span = input.nextElementSibling;
  span.textContent = message;
  span.classList.add("active");
}

// --- Enregistrer la demande avec ID userId + compteur ---
// --- Enregistrer la demande avec ID userId + compteur ---
async function saveRequest(userId, formData) {
  try {
    // Récupérer tous les documents de la collection
    const querySnapshot = await getDocs(collection(db, "request-movie"));

    // Calculer le prochain numéro pour l'utilisateur
    let maxNum = 0;
    querySnapshot.forEach(doc => {
      if (doc.id.startsWith(userId + "_")) {
        const num = parseInt(doc.id.split("_")[1]) || 0;
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    const docId = `${userId}_${nextNum}`;

    // Ajouter l'ID de l'utilisateur dans les données
    const dataToSave = { ...formData, userId };

    // Enregistrement dans Firestore
    await setDoc(doc(db, "request-movie", docId), dataToSave);
    showToast("Demande envoyée !");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    showToast("Erreur lors de l'enregistrement. Réessayez !");
  }
}

// --- Soumission du formulaire ---
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showToast("Vous devez être connecté pour envoyer une demande !");
    return;
  }
  const userId = user.uid;

  let isValid = true;

  const categorie = requestForm.categorie.value.trim();
  const titre = requestForm.titre.value.trim();
  const url = requestForm.url.value.trim();
  const saison = requestForm.saison.value.trim();
  const episode = requestForm.episode.value.trim();
  const resolution = requestForm.resolution.value.trim();

  // --- Validation ---
  if (!categorie) { setError(categorieSelect, "Veuillez sélectionner une catégorie."); isValid = false; }
  if (!titre) { setError(requestForm.titre, "Veuillez saisir un titre."); isValid = false; }
  if (!url) { setError(requestForm.url, "Veuillez saisir une URL."); isValid = false; } 
  else { 
    try { new URL(url); } 
    catch { setError(requestForm.url, "Veuillez saisir une URL valide."); isValid = false; }
  }
  if (!resolution) { setError(requestForm.resolution, "Veuillez sélectionner une résolution."); isValid = false; }
  if (categorie === "series") {
    if (!saison) { setError(requestForm.saison, "Veuillez saisir une saison."); isValid = false; }
    if (!episode) { setError(requestForm.episode, "Veuillez saisir un épisode."); isValid = false; }
  }

  if (!isValid) return;

  // --- Construction de l'objet à envoyer (sans userId) ---
  const formData = { categorie, titre, url, resolution };
  if (saison) formData.saison = saison;
  if (episode) formData.episode = episode;

  // --- Enregistrement dans Firestore ---
  await saveRequest(userId, formData);

  // --- Reset du formulaire ---
  requestForm.reset();
  seriesOptions.classList.remove("active");
  episodeWrapper.classList.remove("active");
});
