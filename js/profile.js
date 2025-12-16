// profile.js
import { auth, db } from './database.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// ----------------------
// Sélection des éléments DOM
// ----------------------
const profileAvatar = document.getElementById('profileAvatar');
const profilePseudo = document.getElementById('profilePseudo');
const profileFirstname = document.getElementById('profileFirstname');
const panelAvatar = document.getElementById('panelAvatar');
const usernameInput = document.getElementById('username');
const usernameCounter = document.getElementById('usernameCounter');
const firstnameInput = document.getElementById('firstname');
const descriptionInput = document.getElementById('description');
const editProfileForm = document.getElementById('editProfileForm');
const links = document.querySelectorAll('.profile-link');
const favoritesContent = document.getElementById('favoritesContent');
const evaluationContent = document.getElementById('evaluationContent');
const editProfilePanel = document.getElementById('editProfilePanel');
const editProfileBtn = document.querySelector('.edit-profile-btn');
const closePanelBtn = document.querySelector('.close-panel');
const cancelBtn = document.querySelector('.cancel-btn');

// ----------------------
// Gestion des onglets
// ----------------------
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

// ----------------------
// Affichage du profil utilisateur
// ----------------------
async function displayUserProfile(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const photoURL = userData.photoURL || user.photoURL || 'https://via.placeholder.com/150';
    const displayName = userData.nomUtilisateur || user.displayName || 'Utilisateur';
    const firstname = userData.firstname || '';

    // Avatar
    [profileAvatar, panelAvatar].forEach(img => {
        img.src = photoURL;
        img.alt = `${displayName} Avatar`;
    });

    // Pseudo et prénom
    profilePseudo.textContent = displayName;
    profileFirstname.textContent = firstname;

    // Remplir les champs formulaire
    resetProfileForm(userData);
}

// ----------------------
// Réinitialiser le formulaire
// ----------------------
function resetProfileForm(userData) {
    usernameInput.value = userData.nomUtilisateur || '';
    firstnameInput.value = userData.firstname || '';
    descriptionInput.value = userData.description || '';
    usernameCounter.textContent = `${usernameInput.value.length}/14`;
    usernameCounter.style.color = usernameInput.value.length >= 14 ? '#ff3d00' : '#aaa';
}

// ----------------------
// Ouverture / fermeture du panneau
// ----------------------
editProfileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        resetProfileForm(userData);
        editProfilePanel.style.display = 'flex';
    }
});

closePanelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    editProfilePanel.style.display = 'none';
});

cancelBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        resetProfileForm(userData);
    }
    editProfilePanel.style.display = 'none';
});

// ----------------------
// Mise à jour du profil
// ----------------------
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newUsername = usernameInput.value.trim();
    const newFirstname = firstnameInput.value.trim();
    const newDescription = descriptionInput.value.trim();

    if (!newUsername) {
        alert("Le nom d'utilisateur ne peut pas être vide !");
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);

        // Mise à jour Firestore
        await setDoc(userDocRef, {
            nomUtilisateur: newUsername,
            firstname: newFirstname,
            description: newDescription
        }, { merge: true });

        // Mise à jour Firebase Auth
        await updateProfile(user, { displayName: newUsername });

        // Mise à jour affichage
        profilePseudo.textContent = newUsername;
        profileFirstname.textContent = newFirstname;

        const navbarUserPseudo = document.getElementById('userPseudo');
        if (navbarUserPseudo) navbarUserPseudo.textContent = newUsername;

        alert("Profil mis à jour !");
        editProfilePanel.style.display = 'none';
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        alert("Erreur lors de la mise à jour.");
    }
});

// ----------------------
// État de connexion
// ----------------------
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await displayUserProfile(user);
    }
});

// ----------------------
// Désactiver l'auto-complétion
// ----------------------
editProfileForm.setAttribute('autocomplete', 'off');
[usernameInput, firstnameInput, descriptionInput].forEach(input => input.setAttribute('autocomplete', 'off'));

// ----------------------
// Compteur de caractères
// ----------------------
const maxChars = 14;

usernameInput.addEventListener('input', () => {
    if (usernameInput.value.length > maxChars) {
        usernameInput.value = usernameInput.value.slice(0, maxChars);
    }
    const length = usernameInput.value.length;
    usernameCounter.textContent = `${length}/${maxChars}`;
    usernameCounter.style.color = length >= maxChars ? '#ff3d00' : '#aaa';
});
