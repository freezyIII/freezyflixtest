import { auth, db } from './database.js';
import { collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// ---- Sélecteurs ----
const form = document.getElementById('supportForm');
const toast = document.getElementById('toast');
const typeSelect = document.getElementById('type');
const messageInput = document.getElementById('message');
const urlInput = document.getElementById('url');
const submitBtn = form.querySelector('button[type="submit"]');

// ---- Reset messages d'erreur au typing ----
[typeSelect, messageInput, urlInput].forEach(el => el.addEventListener('input', () => {
  const span = el.nextElementSibling;
  span.textContent = '';
  span.classList.remove('active');
}));

// ---- Fonction Toast ----
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ---- Fonction pour sauvegarder le support ----
async function saveSupport(userId, formData) {
  try {
    // Génération d'un ID unique pour Firestore
    const docId = `${userId}_${Date.now()}`;
    await setDoc(doc(db, "support", docId), {
      ...formData,
      userId,
      date: new Date().toISOString()
    });
    showToast("Message envoyé !");
  } catch (err) {
    console.error("Erreur Firebase :", err);
    showToast("Erreur lors de l'envoi. Réessayez !");
  }
}

// ---- Submit du formulaire ----
form.addEventListener('submit', async e => {
  e.preventDefault();
  submitBtn.disabled = true;

  const user = auth.currentUser;
  if (!user) {
    showToast("Vous devez être connecté pour envoyer un message !");
    submitBtn.disabled = false;
    return;
  }

  // ---- Validation du formulaire ----
  let isValid = true;

  if (!typeSelect.value) {
    typeSelect.nextElementSibling.textContent = "Veuillez sélectionner un type de demande.";
    typeSelect.nextElementSibling.classList.add("active");
    isValid = false;
  }

  if (!messageInput.value.trim()) {
    messageInput.nextElementSibling.textContent = "Veuillez saisir un message.";
    messageInput.nextElementSibling.classList.add("active");
    isValid = false;
  }

  if (urlInput.value.trim()) {
    try {
      new URL(urlInput.value);
    } catch {
      urlInput.nextElementSibling.textContent = "Veuillez saisir une URL valide.";
      urlInput.nextElementSibling.classList.add("active");
      isValid = false;
    }
  }

  if (!isValid) {
    submitBtn.disabled = false;
    return;
  }

  // ---- Préparer les données et sauvegarder ----
  const formData = {
    type: typeSelect.value,
    message: messageInput.value.trim(),
    url: urlInput.value.trim() || null
  };

  await saveSupport(user.uid, formData);

  form.reset();
  submitBtn.disabled = false;
});
