// ================== IMPORTS ==================
import { auth, provider, signInWithPopup, signOut, db } from './database.js';
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
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
  if (!userPseudo || !Avatar || !profileMenuContainer || !loginBtn) return;

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
let unsubscribeUser = null;

onAuthStateChanged(auth, (user) => {
  if (unsubscribeUser) {
    unsubscribeUser();
    unsubscribeUser = null;
  }

  if (!user) {
    hideUser();
    return;
  }

  const userRef = doc(db, "users", user.uid);
  unsubscribeUser = onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    showUser({
      displayName: data.nomUtilisateur,
      photoURL: data.photoURL
    });
  });
});



// ================== LOGIN ==================
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            // Formatage de la date en français
            const now = new Date();
            const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = now.toLocaleString('fr-FR', options).replace('à', 'à');

if (!snap.exists()) {
  await setDoc(userRef, {
    nomUtilisateur: user.displayName || "",
    nomUtilisateur_lower: (user.displayName || "").toLowerCase(), // ✅ Ajout
    email: user.email || "",
    photoURL: user.photoURL || "",
    dateInscription: formattedDate
  });
} else {
  await setDoc(userRef, {
    nomUtilisateur: user.displayName || "",
    nomUtilisateur_lower: (user.displayName || "").toLowerCase(), // ✅ Ajout
    email: user.email || "",
    photoURL: snap.data().photoURL || user.photoURL
  }, { merge: true });
}


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
    // Pas besoin de timeout, le onAuthStateChanged s'occupe de tout
    window.location.href = "index.html";
  });
}




const menuSettings = document.getElementById('menuSettings');

if (menuSettings) {
menuSettings.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
        // L'utilisateur connecté peut aller à la page sans UID dans l'URL
        window.location.href = "request-movie.html";
    } else {
        alert("Veuillez vous connecter pour faire une demande de film.");
        window.location.href = "index.html";
    }
});

}


// ================== SEARCH ==================
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") { // Quand l'utilisateur appuie sur Entrée
            const query = searchInput.value.trim();
            if (query) {
                // Redirection vers search.html avec le paramètre q
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }
    });
}


