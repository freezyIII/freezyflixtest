import { auth, db } from './database.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

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
let savedAvatarUrl = '';

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

    try {
        const userDocRef = doc(db, "users", user.uid);
        const finalAvatarUrl = tempAvatarUrl || user.photoURL;

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

auth.onAuthStateChanged(async (user) => {
    if (user) {
        await displayUserProfile(user);
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

const animation = lottie.loadAnimation({
    container: document.getElementById('avatarAnimation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/animations/avatar.json'
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
    tempAvatarUrl = newAvatarUrl || user.photoURL;
    panelAvatar.src = tempAvatarUrl;
    profileAvatar.src = tempAvatarUrl;

    changeAvatarPanel.style.display = 'none';
    changeAvatarForm.reset();
});
