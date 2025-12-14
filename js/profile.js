import { auth, db } from './database.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Elements DOM
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
    if (tabName === "Favoris") {
        favoritesContent.style.display = "flex";
        evaluationContent.style.display = "none";
    } else if (tabName === "Évaluation") {
        favoritesContent.style.display = "none";
        evaluationContent.style.display = "flex";
    }
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

// Affichage des infos utilisateur
auth.onAuthStateChanged(async user => {
    if (user) {
        try {
            const userDocRef = doc(db, "utilisateurs", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                profilePseudo.textContent = userData.nomUtilisateur;
                profileAvatar.src = userData.imageProfil;
                panelAvatar.src = userData.imageProfil;
                usernameInput.value = userData.nomUtilisateur;
            } else {
                profilePseudo.textContent = user.displayName || "Utilisateur";
                profileAvatar.src = user.photoURL || "images/default-avatar.png";
                panelAvatar.src = user.photoURL || "images/default-avatar.png";
                usernameInput.value = user.displayName || "";
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
        }
    } else {
        window.location.href = 'index.html';
    }
});

// Mettre à jour le nom d'utilisateur dans Firestore
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    const user = auth.currentUser;

    if (user && newUsername) {
        try {
            const userDocRef = doc(db, "utilisateurs", user.uid);
            await updateDoc(userDocRef, {
                nomUtilisateur: newUsername
            });
            profilePseudo.textContent = newUsername;
            alert("Nom d'utilisateur mis à jour !");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du nom :", error);
            alert("Erreur lors de la mise à jour.");
        }
    }
});
