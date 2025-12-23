const requestForm = document.getElementById("requestForm");
const categorieSelect = document.getElementById("categorie");
const seriesOptions = document.getElementById("seriesOptions");
const episodeWrapper = document.getElementById("episodeWrapper");
const toast = document.getElementById("toast");

// Affichage dynamique des champs séries
categorieSelect.addEventListener("change", () => {
  const isSeries = categorieSelect.value === "series";
  seriesOptions.classList.toggle("active", isSeries);
  episodeWrapper.classList.toggle("active", isSeries);
  clearError(categorieSelect);
});

// Fonction pour effacer les erreurs
function clearError(input) {
  const span = input.nextElementSibling;
  span.textContent = "";
  span.classList.remove("active");
}

// Effacer les erreurs au changement ou à la saisie
["categorie", "titre", "url", "saison", "episode"].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => clearError(input));
});

// Affichage toast
function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

// Validation du formulaire
requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let isValid = true;

  const categorie = requestForm.categorie.value.trim();
  const titre = requestForm.titre.value.trim();
  const url = requestForm.url.value.trim();
  const saison = requestForm.saison.value.trim();
  const episode = requestForm.episode.value.trim();

  // Validation
  if (!categorie) { setError(categorieSelect, "Veuillez sélectionner une catégorie."); isValid = false; }
  if (!titre) { setError(requestForm.titre, "Veuillez saisir un titre."); isValid = false; }
  if (!url) {
    setError(requestForm.url, "Veuillez saisir une URL.");
    isValid = false;
  } else {
    try { new URL(url); } catch { setError(requestForm.url, "Veuillez saisir une URL valide."); isValid = false; }
  }
  if (categorie === "series") {
    if (!saison) { setError(requestForm.saison, "Veuillez saisir une saison."); isValid = false; }
    if (!episode) { setError(requestForm.episode, "Veuillez saisir un épisode."); isValid = false; }
  }

  if (!isValid) return;

  const formData = { categorie, titre, url, saison: saison || null, episode: episode || null };
  console.log("Nouvelle demande :", formData);

  requestForm.reset();
  seriesOptions.classList.remove("active");
  episodeWrapper.classList.remove("active");

  showToast("Demande envoyée !");
});

// Fonction pour afficher les erreurs
function setError(input, message) {
  const span = input.nextElementSibling;
  span.textContent = message;
  span.classList.add("active");
}
