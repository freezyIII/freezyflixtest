import { auth, db } from './database.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

const profileAvatar = document.getElementById('profileAvatar');
const profilePseudo = document.getElementById('profilePseudo');
const panelAvatar = document.getElementById('panelAvatar');
const usernameInput = document.getElementById('username');
const editProfileForm = document.getElementById('editProfileForm');
const links = document.querySelectorAll('.profile-link');
const favoritesContent = document.getElementById('favoritesContent');
const evaluationContent = document.getElementById('evaluationContent');

// Gestion des onglets
function showTab(tabName) {
    favoritesContent.style.display = tabName === "Favoris" ? "flex" : "none";
    evaluationContent.style.display = tabName === "Évaluation" ? "flex" : "none";
}

links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        showTab(link.textContent.trim());
    });
});

// Affiche l'onglet actif au chargement
const activeLink = document.querySelector('.profile-link.active');
if (activeLink) showTab(activeLink.textContent.trim());

// Mise à jour du profil
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    const user = auth.currentUser;

    if (user && newUsername) {
        try {
            const userDocRef = doc(db, "utilisateurs", user.uid);
            await updateDoc(userDocRef, { nomUtilisateur: newUsername });
            profilePseudo.textContent = newUsername;
            alert("Nom d'utilisateur mis à jour !");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du nom :", error);
            alert("Erreur lors de la mise à jour.");
        }
    }
});

// Affichage de l'avatar utilisateur
function displayUserAvatar(user) {
    const photoURL = user.photoURL || 'https://via.placeholder.com/150';
    [profileAvatar, panelAvatar].forEach(img => {
        img.src = photoURL;
        img.alt = `${user.displayName || 'Utilisateur'} Avatar`;
    });
    profilePseudo.textContent = user.displayName || 'Utilisateur';
}

auth.onAuthStateChanged((user) => {
    if (user) displayUserAvatar(user);
});
