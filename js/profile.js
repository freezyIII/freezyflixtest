import { auth, db } from './database.js';
import { doc,getDoc,setDoc,collection,getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const founderUid = "nvZu4gkT8JR8eDAraUyl0qobUox1";
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
const panelAvatarWrapper = document.querySelector('.panel-avatar-wrapper');
const changeAvatarPanel = document.getElementById('changeAvatarPanel');
const closeChangeAvatar = changeAvatarPanel.querySelector('.close-panel');
const cancelChangeAvatar = changeAvatarPanel.querySelector('.cancel-btn');
const changeAvatarForm = document.getElementById('changeAvatarForm');
const avatarUrlInput = document.getElementById('avatarUrl');
let tempAvatarUrl = '';

const params = new URLSearchParams(window.location.search);
const profileUid = params.get("uid");


function showTab(tabName) {
  favoritesContent.style.display = tabName === "Favoris" ? "block" : "none";
  evaluationContent.style.display = tabName === "Évaluation" ? "block" : "none";

  if (tabName === "Favoris") loadFavorites();
  if (tabName === "Évaluation") loadEvaluations();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 🔑 UID à afficher : soit celui dans l’URL, soit le sien
  const uidToDisplay = profileUid || user.uid;

  await displayUserProfileByUid(uidToDisplay, user.uid);
});


links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        showTab(link.textContent.trim());
    });
});

const activeLink = document.querySelector('.profile-link.active');
if (activeLink) showTab(activeLink.textContent.trim());

async function displayUserProfile(user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const photoURL = userData.photoURL || user.photoURL || 'https://via.placeholder.com/150';
    const displayName = userData.nomUtilisateur || user.displayName || 'Utilisateur';
    const firstname = userData.firstname || '';

    [profileAvatar, panelAvatar].forEach(img => {
        img.src = photoURL;
        img.alt = `${displayName} Avatar`;
    });

    profilePseudo.textContent = displayName;
    profileFirstname.textContent = firstname;

    resetProfileForm(userData);
}

function resetProfileForm(userData) {
    usernameInput.value = userData.nomUtilisateur || '';
    firstnameInput.value = userData.firstname || '';
    descriptionInput.value = userData.description || '';
    usernameCounter.textContent = `${usernameInput.value.length}/14`;
    usernameCounter.style.color = usernameInput.value.length >= 14 ? '#ff3d00' : '#aaa';
}

editProfileBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const uidToDisplay = profileUid || user.uid; // UID du profil affiché
    if (uidToDisplay !== user.uid) return; // sécurité : on ne peut modifier que son propre profil

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    resetProfileForm(userData);

    // Préremplissage de l'avatar du panel
    panelAvatar.src = userData.photoURL || user.photoURL || 'https://via.placeholder.com/150';
    avatarUrlInput.value = userData.photoURL || '';

    editProfilePanel.style.display = 'flex';
});


closePanelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    editProfilePanel.style.display = 'none';
});

cancelBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        profileAvatar.src = userData.photoURL || user.photoURL;
        panelAvatar.src = userData.photoURL || user.photoURL;

        resetProfileForm(userData);

        avatarUrlInput.value = userData.photoURL || '';
    }
    tempAvatarUrl = '';
    editProfilePanel.style.display = 'none';
});

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

    // Si tempAvatarUrl est vide, utilise l'avatar affiché sur le panel
    const finalAvatarUrl = tempAvatarUrl || panelAvatar.src || user.photoURL;

    try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            nomUtilisateur: newUsername,
            firstname: newFirstname,
            description: newDescription,
            photoURL: finalAvatarUrl
        }, { merge: true });

        await updateProfile(user, { displayName: newUsername });

        profilePseudo.textContent = newUsername;
        profileFirstname.textContent = newFirstname;
        profileAvatar.src = finalAvatarUrl;
        panelAvatar.src = finalAvatarUrl;
        const navbarAvatar = document.getElementById('Avatar');
        if (navbarAvatar) navbarAvatar.src = finalAvatarUrl;

        avatarUrlInput.value = (finalAvatarUrl === user.photoURL) ? '' : finalAvatarUrl;

        showToast("Profil mis à jour !");
        editProfilePanel.style.display = 'none';
        tempAvatarUrl = '';
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
        alert("Erreur lors de la mise à jour.");
    }
});

editProfileForm.setAttribute('autocomplete', 'off');
[usernameInput, firstnameInput, descriptionInput].forEach(input => input.setAttribute('autocomplete', 'off'));

const maxChars = 14;

usernameInput.addEventListener('input', () => {
    if (usernameInput.value.length > maxChars) {
        usernameInput.value = usernameInput.value.slice(0, maxChars);
    }
    const length = usernameInput.value.length;
    usernameCounter.textContent = `${length}/${maxChars}`;
    usernameCounter.style.color = length >= maxChars ? '#ff3d00' : '#aaa';
});

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

panelAvatarWrapper.addEventListener('click', async () => {
    await fillAvatarInput();
    changeAvatarPanel.style.display = 'flex';
});

closeChangeAvatar.addEventListener('click', (e) => {
    e.preventDefault();
    changeAvatarPanel.style.display = 'none';
});
cancelChangeAvatar.addEventListener('click', (e) => {
    e.preventDefault();
    changeAvatarPanel.style.display = 'none';
});

async function fillAvatarInput() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const savedPhotoURL = userData.photoURL || '';
    const googlePhotoURL = user.photoURL || '';
    avatarUrlInput.value = (savedPhotoURL && savedPhotoURL !== googlePhotoURL) ? savedPhotoURL : '';
}

changeAvatarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newAvatarUrl = avatarUrlInput.value.trim();
    tempAvatarUrl = newAvatarUrl || panelAvatar.src || 'https://via.placeholder.com/150';

    // Mise à jour de la prévisualisation uniquement
    panelAvatar.src = tempAvatarUrl;

    changeAvatarPanel.style.display = 'none';
});


function loadEvaluations() {
  const container = document.getElementById("evaluationContent");
  const evaluations = JSON.parse(localStorage.getItem("evaluations")) || [];

  container.innerHTML = "";

  if (evaluations.length === 0) {
    container.innerHTML = `
      <div class="evaluation-empty">
        <svg class="tab-item-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path>
        </svg>
        <p class="tab-text">Aucune évaluation pour l'instant</p>
      </div>
    `;
    return;
  }
}


async function loadFavorites() {
  const container = document.getElementById("favoritesContent");
  container.innerHTML = "";

  const user = auth.currentUser;
  if (!user) {
    console.warn("Utilisateur non connecté");
    return;
  }

  const favoritesRef = collection(db, "users", user.uid, "favorites");

  try {
const q = query(favoritesRef, orderBy("createdAt", "desc"));
const snapshot = await getDocs(q);

if (snapshot.empty) {
  container.innerHTML = `
    <div class="favorites-empty">
      <svg class="tab-item-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path>
      </svg>
      <p class="tab-text">Aucun favori pour l'instant</p>
    </div>
  `;
  return;
}


    const grid = document.createElement("div");
    grid.className = "movie-grid";

    snapshot.forEach(docSnap => {
      const movie = docSnap.data();

const item = document.createElement("div");
item.className = "movie-grid-item";
item.setAttribute("data-title", movie.title); // <-- AJOUT

item.innerHTML = `
  <a href="movie-details.html?title=${encodeURIComponent(movie.title)}">
    <img src="${movie.img}" loading="lazy" />

    ${movie.type === "serie" ? `<div class="serie">SÉRIE</div>` : ""}
    ${movie.resolution ? `<div class="resolution">${movie.resolution}</div>` : ""}
  </a>
`;

      grid.appendChild(item);
    });

    container.appendChild(grid);

  } catch (err) {
    console.error("Erreur chargement favoris :", err);
  }
}


async function displayUserProfileByUid(uidToDisplay, currentUserUid) {
  const userDocRef = doc(db, "users", uidToDisplay);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    alert("Profil introuvable");
    return;
  }

  const userData = userSnap.data();
  const photoURL = userData.photoURL || 'https://via.placeholder.com/150';
  const displayName = userData.nomUtilisateur || 'Utilisateur';
  const firstname = userData.firstname || '';

  profileAvatar.src = photoURL;
  profileAvatar.alt = `${displayName} Avatar`;
  profilePseudo.textContent = displayName;
  profileFirstname.textContent = firstname;

  // 🔒 Si ce n'est PAS ton profil → on bloque l’édition
  if (uidToDisplay !== currentUserUid) {
    editProfileBtn.style.display = "none";
    favoritesContent.style.display = "none";
    evaluationContent.style.display = "none";
  } else {
    loadFavorites();
  }

  // ✅ Animation Lottie pour le fondateur seulement
  const avatarAnimationDiv = document.getElementById('avatarAnimation');
  if (uidToDisplay === founderUid) {
    avatarAnimationDiv.style.display = 'block'; // affiche la div
    lottie.loadAnimation({
      container: avatarAnimationDiv,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/animations/avatar.json'
    });
  } else {
    avatarAnimationDiv.style.display = 'none'; // cache la div
  }
}
