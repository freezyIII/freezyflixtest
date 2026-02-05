import { auth, db } from './database.js';
import {doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, deleteDoc}
from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import {updateProfile,onAuthStateChanged,reauthenticateWithPopup,GoogleAuthProvider,deleteUser,signOut} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const profileAvatar = document.getElementById('profileAvatar');
const profilePseudo = document.getElementById('profilePseudo');
const profileFirstname = document.getElementById('profileFirstname');
const profileDescription = document.getElementById('profileDescription');
const panelAvatar = document.getElementById('panelAvatar');

const usernameInput = document.getElementById('username');
const usernameCounter = document.getElementById('usernameCounter');
const firstnameInput = document.getElementById('firstname');
const firstnameCounter = document.getElementById('firstnameCounter');
const descriptionInput = document.getElementById('description');
const descriptionCounter = document.getElementById('descriptionCounter');

const editProfileBtn = document.querySelector('.edit-profile-btn');
const editProfilePanel = document.getElementById('editProfilePanel');
const closePanelBtn = document.querySelector('.close-panel');
const cancelBtn = document.querySelector('.cancel-btn');

const panelAvatarWrapper = document.querySelector('.panel-avatar-wrapper');
const changeAvatarPanel = document.getElementById('changeAvatarPanel');
const closeChangeAvatar = changeAvatarPanel.querySelector('.close-panel');
const cancelChangeAvatar = changeAvatarPanel.querySelector('.cancel-btn');
const changeAvatarForm = document.getElementById('changeAvatarForm');
const avatarUrlInput = document.getElementById('avatarUrl');

const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteConfirmPopup = document.getElementById('deleteConfirmPopup');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');

const banUserPopup = document.getElementById('banUserPopup');
const banReasonInput = document.getElementById('banReason');
const banDurationSelect = document.getElementById('banDuration');
const cancelBanBtn = document.getElementById('cancelBan');
const confirmBanBtn = document.getElementById('confirmBan');

const favoritesContent = document.getElementById('favoritesContent');
const evaluationContent = document.getElementById('evaluationContent');
const links = document.querySelectorAll('.profile-link');

const friendsPanel = document.getElementById('friendsPanel');
const friendsList = document.getElementById('friendsList');
const searchInput = document.getElementById('friendSearch');

const followPanel = document.getElementById('followPanel');
const followList = document.getElementById('followList');
const followPanelTitle = document.getElementById('followPanelTitle');
const closeFollowPanel = document.getElementById('closeFollowPanel');

const followBtn = document.getElementById('followBtn');

const toast = document.getElementById('toast');

const MAX_USERNAME_CHARS = 16;
const MAX_FIRSTNAME_CHARS = 16;
const MAX_DESCRIPTION_CHARS = 200;

let allFriends = [];

let tempAvatarUrl = '';
const urlParams = new URLSearchParams(window.location.search);

const profileUid = urlParams.get("uid");

const showToast = (message, duration = 3000) => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
};

const formatDateInscription = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split(" ");
  if (parts.length < 4) return "";

  const day = parts[0].padStart(2, "0");
  const monthName = parts[1].toLowerCase();
  const year = parts[2].slice(-2);

  const months = {
    janvier: "01", février: "02", fevrier: "02", mars: "03", avril: "04",
    mai: "05", juin: "06", juillet: "07", août: "08", aout: "08",
    septembre: "09", octobre: "10", novembre: "11", décembre: "12", decembre: "12"
  };
  const month = months[monthName] || "00";
  return `inscrit le ${day}.${month}.${year}`;
};

const truncateInput = (input, maxLength) => input.value.slice(0, maxLength);

const resetCounter = (input, counterEl, max) => {
  const length = input.value.length;
  counterEl.textContent = `${length}/${max}`;
  counterEl.style.color = length >= max ? '#ff3d00' : '#aaa';
};

const isUsernameAvailable = async (username, currentUid) => {
  const q = query(
    collection(db, "users"),
    where("nomUtilisateur_lower", "==", username.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return true;
  return snap.docs.every(doc => doc.id === currentUid);
};

const showTab = (tabName) => {
  favoritesContent.style.display = tabName === "Favoris" ? "block" : "none";
  evaluationContent.style.display = tabName === "Évaluation" ? "block" : "none";
  if (tabName === "Favoris") loadFavorites();
  if (tabName === "Évaluation") loadEvaluations();
};

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

const displayUserProfileByUid = async (uidToDisplay, currentUserUid) => {
  try {
    const userSnap = await getDoc(doc(db, "users", uidToDisplay));
    if (!userSnap.exists()) { alert("Profil introuvable"); return; }
    const userData = userSnap.data();

    profileAvatar.src = userData.photoURL || 'https://via.placeholder.com/150';
    profilePseudo.textContent = userData.nomUtilisateur || 'Utilisateur';
    profileFirstname.textContent = userData.firstname || '';
    profileDescription.textContent = userData.description || '';

    const profileDateEl = document.getElementById("profileDate");
    const formattedDate = formatDateInscription(userData.dateInscription || "");
    if (formattedDate) {
      profileDateEl.textContent = formattedDate;
      profileDateEl.style.display = "block";
    } else profileDateEl.style.display = "none";

    if (uidToDisplay !== currentUserUid) editProfileBtn.style.display = "none";

    loadFavorites();
    loadEvaluations();

const avatarAnimationDiv = document.getElementById('avatarAnimation');

if (userData?.founder === true) {
  avatarAnimationDiv.style.display = 'block';

  if (!avatarAnimationDiv.dataset.loaded) {
    lottie.loadAnimation({
      container: avatarAnimationDiv,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/animations/avatar.json'
    });
    avatarAnimationDiv.dataset.loaded = "true";
  }
} else {
  avatarAnimationDiv.style.display = 'none';
}

  } catch (err) {
    console.error("Erreur affichage profil :", err);
  }
};

async function loadFavorites() {
  const container = favoritesContent;
  container.innerHTML = "";

  const user = auth.currentUser;
  if (!user) return;
  const uidToLoad = profileUid || user.uid;

  try {
    const q = query(collection(db, "users", uidToLoad, "favorites"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `<div class="favorites-empty"><p>Aucun favori pour l'instant</p></div>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "movie-grid";
snapshot.forEach(docSnap => {
  const movie = docSnap.data();

  const item = document.createElement("div");
  item.className = "movie-grid-item";
  item.setAttribute("data-title", movie.title);

  item.innerHTML = `
    <a href="movie-details.html?title=${encodeURIComponent(movie.title)}">
      <img src="${movie.img}" loading="lazy" />
      ${movie.type === "serie" ? `<div class="serie">SÉRIE</div>` : ""}
      ${movie.resolution ? `<div class="resolution">${movie.resolution}</div>` : ""}
    </a>
    <div class="movie-title">${movie.title}</div>  <!-- TITRE SOUS L'IMAGE -->
  `;

  grid.appendChild(item);
});
    container.appendChild(grid);
  } catch (err) {
    console.error("Erreur chargement favoris :", err);
  }
}

function loadEvaluations() {
  const container = evaluationContent;
  const evaluations = JSON.parse(localStorage.getItem("evaluations")) || [];
  container.innerHTML = evaluations.length ? "" : `<div class="evaluation-empty"><p>Aucune évaluation pour l'instant</p></div>`;
}

const resetProfileForm = (userData) => {
  usernameInput.value = userData.nomUtilisateur || '';
  resetCounter(usernameInput, usernameCounter, MAX_USERNAME_CHARS);

  firstnameInput.value = userData.firstname || '';
  resetCounter(firstnameInput, firstnameCounter, MAX_FIRSTNAME_CHARS);

  descriptionInput.value = userData.description || '';
  resetCounter(descriptionInput, descriptionCounter, MAX_DESCRIPTION_CHARS);

  panelAvatar.src = userData.photoURL || 'https://via.placeholder.com/150';

  const isDefaultAvatar = !userData.customAvatarURL || userData.customAvatarURL.includes('via.placeholder.com');
  avatarUrlInput.value = isDefaultAvatar ? '' : userData.customAvatarURL;

  tempAvatarUrl = null;

  editProfilePanel.dataset.initialAvatar = panelAvatar.src;
  editProfilePanel.dataset.initialCustomAvatar = avatarUrlInput.value;
};

[usernameInput, firstnameInput, descriptionInput].forEach(input => {
  const max = (input === usernameInput) ? MAX_USERNAME_CHARS :
              (input === firstnameInput) ? MAX_FIRSTNAME_CHARS : MAX_DESCRIPTION_CHARS;
  const counterEl = (input === usernameInput) ? usernameCounter :
                    (input === firstnameInput) ? firstnameCounter : descriptionCounter;

  input.addEventListener('input', () => {
    input.value = truncateInput(input, max);
    resetCounter(input, counterEl, max);
  });
});

editProfileBtn.addEventListener('click', async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user || profileUid && profileUid !== user.uid) return;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  resetProfileForm(userSnap.exists() ? userSnap.data() : {});
  editProfilePanel.style.display = 'flex';
});

[closePanelBtn, cancelBtn].forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();

    panelAvatar.src = editProfilePanel.dataset.initialAvatar;
    avatarUrlInput.value = editProfilePanel.dataset.initialCustomAvatar;

    tempAvatarUrl = null;

    editProfilePanel.style.display = 'none';
  })
);

panelAvatarWrapper.addEventListener('click', () => {
  changeAvatarPanel.style.display = 'flex';
});

[closeChangeAvatar, cancelChangeAvatar].forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();
    changeAvatarPanel.style.display = 'none';
  })
);

changeAvatarForm.addEventListener('submit', e => {
  e.preventDefault();
  const inputUrl = avatarUrlInput.value.trim();

  if (inputUrl) {e
    tempAvatarUrl = inputUrl;
    panelAvatar.src = tempAvatarUrl;
  } else {
    tempAvatarUrl = editProfilePanel.dataset.initialAvatar.includes('via.placeholder.com') || auth.currentUser.photoURL 
      ? auth.currentUser.photoURL || 'https://via.placeholder.com/150' 
      : 'https://via.placeholder.com/150';
    panelAvatar.src = tempAvatarUrl;
  }

  changeAvatarPanel.style.display = 'none';
});

editProfileForm.addEventListener('submit', async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const newUsername = usernameInput.value.trim().replace(/\s+/g, ' ');
  if (!newUsername) return showToast("Le nom d'utilisateur est obligatoire");

  if (!(await isUsernameAvailable(newUsername, user.uid))) {
    return showToast("Ce nom d'utilisateur est déjà utilisé ❌", 4000);
  }

  try {
    const userDocRef = doc(db, "users", user.uid);

const finalAvatarUrl = tempAvatarUrl || editProfilePanel.dataset.initialAvatar;

const customAvatarValue = avatarUrlInput.value.trim();
const isDefault = finalAvatarUrl.includes('via.placeholder.com') || finalAvatarUrl === auth.currentUser.photoURL;
const finalCustomAvatar = (!customAvatarValue || isDefault) ? null : customAvatarValue;

await setDoc(userDocRef, {
  nomUtilisateur: newUsername,
  nomUtilisateur_lower: newUsername.toLowerCase(),
  firstname: firstnameInput.value.trim(),
  description: descriptionInput.value.trim(),
  photoURL: finalAvatarUrl,
  customAvatarURL: finalCustomAvatar
}, { merge: true });

    await updateProfile(user, { displayName: newUsername });

    profilePseudo.textContent = newUsername;
    profileFirstname.textContent = firstnameInput.value.trim();
    profileDescription.textContent = descriptionInput.value.trim();
    profileAvatar.src = finalAvatarUrl;
    panelAvatar.src = finalAvatarUrl;

    tempAvatarUrl = null;

    showToast("Profil mis à jour !");
    editProfilePanel.style.display = 'none';
  } catch (err) {
    console.error("Erreur mise à jour profil :", err);
    showToast("Erreur lors de la mise à jour");
  }
});

const deleteUserData = async (uid) => {
  // Supprimer des followers
  const followersSnap = await getDocs(collection(db, "users", uid, "followers"));
  for (const docSnap of followersSnap.docs) {
    const followerUid = docSnap.id;
    // Supprimer de ton côté
    await deleteDoc(doc(db, "users", uid, "followers", followerUid));
    // Supprimer dans leur "following"
    await deleteDoc(doc(db, "users", followerUid, "following", uid));
  }

  // Supprimer des following
  const followingSnap = await getDocs(collection(db, "users", uid, "following"));
  for (const docSnap of followingSnap.docs) {
    const followingUid = docSnap.id;
    // Supprimer de ton côté
    await deleteDoc(doc(db, "users", uid, "following", followingUid));
    // Supprimer dans leur "followers"
    await deleteDoc(doc(db, "users", followingUid, "followers", uid));
  }

  // Supprimer favoris
  const favSnap = await getDocs(collection(db, "users", uid, "favorites"));
  for (const d of favSnap.docs) {
    await deleteDoc(d.ref);
  }

  // Supprimer ton profil
  await deleteDoc(doc(db, "users", uid));
};

deleteAccountBtn.addEventListener('click', e => {
  e.preventDefault();
  deleteConfirmPopup.style.display = 'flex';
});

cancelDeleteBtn.addEventListener('click', () => deleteConfirmPopup.style.display = 'none');

confirmDeleteBtn.addEventListener('click', async () => {
  deleteConfirmPopup.style.display = 'none';
  const user = auth.currentUser;
  if (!user) return window.location.href = "index.html";

  try {
    await deleteUserData(user.uid);
    await deleteUser(user);
    window.location.href = "index.html";
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      try {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
        await deleteUserData(user.uid);
        await deleteUser(user);
        window.location.href = "index.html";
      } catch (e) {
        console.error("Suppression annulée :", e);
        window.location.href = "index.html";
      }
    } else {
      console.error("Erreur suppression compte :", error);
      window.location.href = "index.html";
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "index.html";

    document.getElementById('followersCount').addEventListener('click', () => showFollowPanel('followers'));
  document.getElementById('followingCount').addEventListener('click', () => showFollowPanel('following'));

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  if (data.banned) {
      alert(`Vous êtes banni ! Raison : ${data.banReason || "non spécifiée"}`);
      await signOut(auth);
      window.location.href = "index.html";
      return;
  }

  const token = await user.getIdTokenResult(true);
  const tokenValidSince = data.tokenValidSince ? new Date(data.tokenValidSince) : null;
  if (tokenValidSince && token.issuedAtTime * 1000 < tokenValidSince.getTime()) {
      alert("Vous avez été banni !");
      await signOut(auth);
      window.location.href = "index.html";
      return;
  }

  const uidToDisplay = profileUid || user.uid;
  
  await displayUserProfileByUid(uidToDisplay, user.uid);
  await updateFollowCounts();

if (uidToDisplay === user.uid) {
    followBtn.style.display = 'none';
    friendsBtn.style.display = 'flex';
} else {
    followBtn.style.display = 'flex';
    friendsBtn.style.display = 'none';
}


  const adminActions = document.getElementById('adminActions');
  if (data.founder && uidToDisplay !== user.uid) {
      adminActions.style.display = 'flex';
      document.getElementById('banUserBtn').onclick = () => banUserPopup.style.display = 'flex';
      cancelBanBtn.onclick = () => banUserPopup.style.display = 'none';

confirmBanBtn.onclick = async () => {
  const reason = banReasonInput.value.trim();
  const duration = banDurationSelect.value;
  if (!reason) return;

  await setDoc(doc(db, "users", uidToDisplay), {
      banned: true,
      banReason: reason,
      banDuration: duration,
      banStart: new Date().toISOString(),
      tokenValidSince: new Date().toISOString()
  }, { merge: true });

  banUserPopup.style.display = 'none';
};
}

document.getElementById('friendsBtn').addEventListener('click', () => {
  friendsPanel.style.display = friendsPanel.style.display === 'flex' ? 'none' : 'flex';
});

async function loadFriends() {
  const snapshot = await getDocs(collection(db, "users"));
  allFriends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  displayFriends(allFriends);
}

async function setupFollowButton(button, targetUid) {
  const currentUid = auth.currentUser.uid;

  const followersRef = doc(db, "users", targetUid, "followers", currentUid);
  const followingRef = doc(db, "users", currentUid, "following", targetUid);

  const snap = await getDoc(followersRef);
  if (snap.exists()) {
    button.classList.add('following');
    button.querySelector('span').textContent = 'Abonné';
  }

button.addEventListener('click', async (e) => {
  e.stopPropagation();

  const isFollowing = button.classList.contains('following');

  try {
    if (isFollowing) {
      await deleteDoc(followersRef);
      await deleteDoc(followingRef);
      button.classList.remove('following');
      button.querySelector('span').textContent = 'Suivre';
    } else {
      await setDoc(followersRef, {
        uid: currentUid,
        followedAt: new Date().toISOString()
      });
      await setDoc(followingRef, {
        uid: targetUid,
        followedAt: new Date().toISOString()
      });
      button.classList.add('following');
      button.querySelector('span').textContent = 'Abonné';
    }

    await updateFollowCounts();

  } catch (err) {
    console.error("Erreur follow depuis panel amis :", err);
    showToast("Erreur lors du suivi", 3000);
  }
});
}


function displayFriends(friends) {
  friendsList.innerHTML = '';
  const currentUid = auth.currentUser.uid;

  if (friends.length === 0) {
    friendsList.innerHTML = `<p style="color:#ccc; text-align:center; margin-top:20px;">Aucun résultat</p>`;
    return;
  }

  friends.forEach(friend => {
    if (friend.id === currentUid) return;

    const div = document.createElement('div');
    div.className = 'friend-item';

div.innerHTML = `
  <div class="friend-left">
    <img 
      class="friend-avatar-link"
      data-uid="${friend.id}"
      src="${friend.photoURL || friend.customAvatarURL || 'https://via.placeholder.com/40'}"
    >
    <span>${friend.nomUtilisateur || 'Utilisateur'}</span>
  </div>
  <button class="friend-follow-btn" data-uid="${friend.id}">
    <span>Suivre</span>
  </button>
`;

friendsList.appendChild(div);

div.querySelector('.friend-avatar-link').addEventListener('click', () => {
  window.location.href = `profile.html?uid=${friend.id}`;
});

setupFollowButton(div.querySelector('.friend-follow-btn'), friend.id);  
});
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allFriends.filter(friend => 
    friend.nomUtilisateur?.toLowerCase().includes(query)
  );
  displayFriends(filtered);
});

loadFriends();


});




followBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user || !profileUid) return;

  const currentUserUid = user.uid;
  const profileUserUid = profileUid;

  const followersRef = doc(db, "users", profileUserUid, "followers", currentUserUid);
  const followingRef = doc(db, "users", currentUserUid, "following", profileUserUid);

  try {
    const followersSnap = await getDoc(followersRef);

    if (followersSnap.exists()) {
      await deleteDoc(followersRef);
      await deleteDoc(followingRef);
      followBtn.querySelector('.btn-text').textContent = "Suivre";
    } else {
      await setDoc(followersRef, {
        uid: currentUserUid,
        followedAt: new Date().toISOString()
      });
      await setDoc(followingRef, {
        uid: profileUserUid,
        followedAt: new Date().toISOString()
      });
      followBtn.querySelector('.btn-text').textContent = "Abonné";
    }

    await updateFollowCounts();
  } catch (err) {
    console.error("Erreur follow/unfollow :", err);
    showToast("Impossible de modifier le suivi", 3000);
  }
});


const updateFollowCounts = async () => {
  if (!profileUid) return;

  const followersSnap = await getDocs(collection(db, "users", profileUid, "followers"));
  const followingSnap = await getDocs(collection(db, "users", profileUid, "following"));

  document.getElementById('followersCount').textContent = followersSnap.size;
  document.getElementById('followingCount').textContent = followingSnap.size;

  const isFollowing = followersSnap.docs.some(doc => doc.id === auth.currentUser.uid);
  followBtn.querySelector('.btn-text').textContent = isFollowing ? "Abonné" : "Suivre";
  followBtn.disabled = false;
};


closeFollowPanel.addEventListener('click', () => {
  followPanel.style.display = 'none';
});

const showFollowPanel = async (type) => {
  if (!profileUid) return;
  const isOwner = auth.currentUser.uid === profileUid;
  followList.innerHTML = '';
  followPanelTitle.textContent = type === 'followers' ? 'Abonnés' : 'Abonnement';

  const collectionRef = collection(db, "users", profileUid, type);
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) {
    followList.innerHTML = `<p style="color:#ccc; text-align:center; margin-top:20px;">Aucune personne</p>`;
    followPanel.style.display = 'flex';
    return;
  }

for (const docSnap of snapshot.docs) {
    const userUid = docSnap.id;
    const userSnap = await getDoc(doc(db, "users", userUid));
    const userData = userSnap.exists() ? userSnap.data() : { nomUtilisateur: 'Utilisateur', photoURL: '' };

    const div = document.createElement('div');
    div.className = 'follow-item';
div.innerHTML = `
  <div class="follow-left">
    <img src="${userData.photoURL || 'https://via.placeholder.com/40'}">
    <span>${userData.nomUtilisateur || 'Utilisateur'}</span>
  </div>

  ${
    isOwner && type === 'followers'
      ? `<button class="remove-follower-btn">✕</button>`
      : ''
  }

  ${userUid !== auth.currentUser.uid ? `
    <button class="follow-btn follow-list-btn">
      <span class="btn-text">Suivre</span>
    </button>
  ` : ``}
`;

const removeBtn = div.querySelector('.remove-follower-btn');

if (removeBtn) {
  removeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    await deleteDoc(doc(db, "users", profileUid, "followers", userUid));
    await deleteDoc(doc(db, "users", userUid, "following", profileUid));

    div.remove();
    await updateFollowCounts();
  });
}


div.querySelector('.follow-left').addEventListener('click', () => {
  window.location.href = `profile.html?uid=${userUid}`;
});

const followBtn = div.querySelector('.follow-list-btn');

if (followBtn) {
  const currentUid = auth.currentUser.uid;

  const followersRef = doc(db, "users", userUid, "followers", currentUid);
  const followingRef = doc(db, "users", currentUid, "following", userUid);

  const snap = await getDoc(followersRef);
  if (snap.exists()) {
    followBtn.classList.add('following');
    followBtn.querySelector('.btn-text').textContent = "Abonné";
  }

  followBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    const isFollowing = followBtn.classList.contains('following');

    if (isFollowing) {
      await deleteDoc(followersRef);
      await deleteDoc(followingRef);
      followBtn.classList.remove('following');
      followBtn.querySelector('.btn-text').textContent = "Suivre";
    } else {
      await setDoc(followersRef, {
        uid: currentUid,
        followedAt: new Date().toISOString()
      });
      await setDoc(followingRef, {
        uid: userUid,
        followedAt: new Date().toISOString()
      });
      followBtn.classList.add('following');
      followBtn.querySelector('.btn-text').textContent = "Abonné";
    }

    await updateFollowCounts();
  });
}

    followList.appendChild(div);
}


  followPanel.style.display = 'flex';
};
