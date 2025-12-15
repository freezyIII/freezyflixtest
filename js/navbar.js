import { auth, provider, signInWithPopup, signOut, db } from './database.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Elements DOM
const loginBtn = document.getElementById('loginBtn');
const userPseudo = document.getElementById('userPseudo');
const profileMenuContainer = document.getElementById('profileMenuContainer');
const Avatar = document.getElementById('Avatar');
const menuLogout = document.getElementById('menuLogout');
const dropdownMenu = document.getElementById('dropdownMenu');
const menuProfile = document.getElementById('menuProfile');

// Fonction pour formater la date en DD-MM-AAAA à HHhMM
function formatDate(date) {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}-${m}-${y} à ${h}h${min}`;
}

// Affiche l'utilisateur connecté
function showUser(user) {
    const pseudo = user.displayName || user.email || 'Utilisateur';
    userPseudo.textContent = pseudo;

    if (user.photoURL) Avatar.src = user.photoURL;
    else Avatar.src = 'default-avatar.png'; // si tu veux un avatar par défaut

    userPseudo.style.display = 'inline-block';
    profileMenuContainer.style.display = 'flex';
    loginBtn.style.display = 'none';
}


// Cache l'utilisateur déconnecté
function hideUser() {
    userPseudo.style.display = 'none';
    profileMenuContainer.style.display = 'none';
    Avatar.removeAttribute('src'); // supprime l'image si déconnecté
    loginBtn.style.display = 'inline-block';
}

// Vérifie si l'utilisateur est déjà connecté
auth.onAuthStateChanged(user => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    if (user) {
        showUser(user);
    } else {
        hideUser();
        loginBtn.style.display = 'inline-block';
    }
});




// Connexion Google
loginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        showUser(user);

        // Fonction pour formater la date comme 15/12/2025 02:04
        function formatDateForFirestore(date) {
            const d = date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear();
            const h = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            return `${d}/${m}/${y} ${h}:${min}`;
        }

        const now = new Date();

        // Sauvegarder l'utilisateur dans Firestore
        const userRef = doc(db, "users", user.uid); // uid utilisé seulement comme identifiant du doc
        await setDoc(userRef, {
            "nomUtilisateur": user.displayName || "",
            "derniereConnexion": formatDateForFirestore(now),
            "compteCreeLe": formatDateForFirestore(user.metadata.creationTime ? new Date(user.metadata.creationTime) : now),
            "email": user.email || "",
            "photoURL": user.photoURL || ""
        }, { merge: true });

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
    }
});



// Déconnexion
menuLogout.addEventListener('click', async () => {
    try {
        await signOut(auth);
        hideUser();
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
    }
});

// Toggle menu avatar
Avatar.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Cacher menu si clic en dehors
document.addEventListener('click', (event) => {
    if (!profileMenuContainer.contains(event.target) && dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
    }
});

// Profil utilisateur
menuProfile.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) window.location.href = `profile.html?uid=${user.uid}`;
    else alert("Vous devez être connecté pour voir le profil !");
});


// nom film sous films
document.querySelectorAll('.movie-grid-item, .movie-item').forEach(item => {
  const link = item.querySelector('a');
  if (!link) return;
  const title = new URL(link.href, location.origin).searchParams.get('title');
  if (title) item.dataset.title = title;
});









