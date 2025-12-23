// ================== IMPORTS ==================
import { auth, provider, signInWithPopup, signOut, db } from './database.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// ================== ELEMENTS NAVBAR ==================
const loginBtn = document.getElementById('loginBtn');
const userPseudo = document.getElementById('userPseudo');
const profileMenuContainer = document.getElementById('profileMenuContainer');
const Avatar = document.getElementById('Avatar');
const dropdownMenu = document.getElementById('dropdownMenu');
const menuProfile = document.getElementById('menuProfile');
const menuLogout = document.getElementById('menuLogout');
const searchInput = document.getElementById('search-input');
const contentSection = document.querySelector('.content');
const randomMovieSection = document.querySelector('.random-movie-section');
const randomBox = document.getElementById("random-movie-box");

// ⛔ Sécurité si navbar absente
if (!loginBtn || !Avatar) {
    console.warn("Navbar absente sur cette page");
}

// ================== UI ==================
function showUser({ displayName, photoURL }) {
    userPseudo.textContent = displayName || "Utilisateur";
    userPseudo.style.display = "inline-block";

    Avatar.src = photoURL || "default-avatar.png";
    profileMenuContainer.style.display = "flex";
    loginBtn.style.display = "none";
}

function hideUser() {
    if (userPseudo) userPseudo.style.display = "none";
    if (profileMenuContainer) profileMenuContainer.style.display = "none";
    if (Avatar) Avatar.removeAttribute("src");
    if (loginBtn) loginBtn.style.display = "inline-block";
}

// ================== AUTH ==================
onAuthStateChanged(auth, async (user) => {
    if (!loginBtn) return; // page sans navbar

    if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};

        showUser({
            displayName: data.nomUtilisateur || user.displayName,
            photoURL: data.photoURL || user.photoURL
        });
    } else {
        hideUser();
    }
});

// ================== LOGIN ==================
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            await setDoc(userRef, {
                nomUtilisateur: user.displayName || "",
                email: user.email || "",
                photoURL: snap.exists() ? snap.data().photoURL || user.photoURL : user.photoURL
            }, { merge: true });

        } catch (err) {
            console.error("Erreur connexion :", err);
        }
    });
}

// ================== MENU ==================
if (Avatar) {
    Avatar.addEventListener("click", () => {
        dropdownMenu.style.display =
            dropdownMenu.style.display === "block" ? "none" : "block";
    });
}

document.addEventListener("click", (e) => {
    if (profileMenuContainer && !profileMenuContainer.contains(e.target)) {
        dropdownMenu.style.display = "none";
    }
});

// ================== PROFIL ==================
if (menuProfile) {
    menuProfile.addEventListener("click", () => {
        const user = auth.currentUser;
        if (user) window.location.href = `profile.html?uid=${user.uid}`;
    });
}

// ================== LOGOUT ==================
if (menuLogout) {
    menuLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        // Petite pause pour laisser Firebase mettre à jour currentUser
        setTimeout(() => {
            window.location.href = "index.html";
        }, 200); // 200ms suffisent
    });
}



const menuSettings = document.getElementById('menuSettings');

if (menuSettings) {
    menuSettings.addEventListener("click", () => {
        const user = auth.currentUser;
        if (user) {
            window.location.href = `settings.html?uid=${user.uid}`;
        } else {
            // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
            window.location.href = "index.html";
        }
    });
}


/* Recherche de Films */
/* Recherche de Films */
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function performSearch() {
  const query = normalizeString(searchInput.value);

  document.querySelectorAll('.movie-grid-item').forEach(item => {
    const title = normalizeString(item.getAttribute('data-title') || '');
    item.hidden = !title.includes(query);
  });

  // Cache / affiche sections
  if (contentSection) contentSection.style.display = query ? 'none' : 'block';
  if (randomMovieSection) randomMovieSection.style.display = query ? 'none' : 'block';

  // Cache / affiche bouton film aléatoire
  if (randomBox) {
    randomBox.style.display = query ? "none" : "block";
  }

  // Met à jour le compteur
  if (typeof updateTotalMovies === "function") {
    updateTotalMovies();
  }
}

if (searchInput) {
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const newQuery = encodeURIComponent(searchInput.value.trim());
    window.location.href = `/search/${newQuery}`;
  }
});
}
