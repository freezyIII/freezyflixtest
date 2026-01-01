import { auth, db } from './database.js';
import { deleteDoc, collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, setDoc, serverTimestamp, where, getDocs } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// ---------------------- VARIABLES ----------------------
const urlParams = new URLSearchParams(window.location.search);
const movieTitle = urlParams.get('title');

const commentBoxContainer = document.getElementById('commentBoxContainer');
const loginToCommentMessage = document.getElementById('loginToCommentMessage');
const commentUsernameEl = document.getElementById('comment-username');
const commentAvatarEl = document.getElementById('commentAvatar');
const container = document.querySelector('.container');
const downloadBtn = document.getElementById('downloadButton');
const submitBtn = document.getElementById('submitBtn');
const commentsList = document.getElementById('commentsList');
const favoriteBtn = document.getElementById("favoriteBtn");

// ---------------------- RECHERCHE DU FILM ----------------------
const selectedMovie = movies.find(movie => movie.title.toLowerCase() === movieTitle?.toLowerCase());

if (!selectedMovie) {
    console.warn("Film non trouvé :", movieTitle);
} else {
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    // Informations principales
    setText('movieTitle', selectedMovie.title);
    setText('movieCategoryText', selectedMovie.category);
    setText('movieDescription', selectedMovie.description);
    setText('releaseDateValue', selectedMovie.releaseDate);
    setText('durationValue', selectedMovie.duration);
    setText('sizeValueTable', selectedMovie.size);
    setText('resolutionValue', selectedMovie.resolution || '--');
    setText('sizeValueText', selectedMovie.size);

    


    // Vidéo YouTube
    if (selectedMovie.youtubeUrl) {
        const iframeContainer = document.getElementById('movieIframeContainer');
        if (iframeContainer) {
            const iframe = document.createElement('iframe');
            iframe.src = selectedMovie.youtubeUrl;
            iframe.width = "100%";
            iframe.height = "480";
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframeContainer.appendChild(iframe);
        }
    }

    // Fond personnalisé
    if (selectedMovie.backgroundUrl) {
        document.body.style.background = `url('${selectedMovie.backgroundUrl}') no-repeat center center fixed`;
        document.body.style.backgroundSize = "cover";
    }

    // Bouton de téléchargement principal
    const forbiddenTitles = [
        "Batman v Superman : L'Aube de la justice",
        "Man of Steel"
    ];

if (downloadBtn) {
    if (forbiddenTitles.includes(selectedMovie.title)) {
        downloadBtn.remove();
    } else {
        // Choisir le lien de téléchargement disponible
        const downloadLink = selectedMovie.downloadUrl || selectedMovie.downloadUrlremuxbluray || selectedMovie.downloadUrlremuxuhd;

        if (downloadLink) {
            downloadBtn.textContent = 'Télécharger';
            downloadBtn.onclick = () => window.open(downloadLink, '_blank');
        } else {
            // Si aucun lien n'est disponible, cacher le bouton
            downloadBtn.style.display = 'none';
        }
    }
}
}

// ---------------------- ESPACE COMMENTAIRE ----------------------
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Utilisateur connecté
        if (loginToCommentMessage) loginToCommentMessage.style.display = "none";
        if (commentBoxContainer) commentBoxContainer.style.visibility = "visible";

        // Récupérer infos utilisateur depuis Firestore
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};

        const displayName = data.nomUtilisateur || user.displayName || "Utilisateur";
        const photoURL = data.photoURL || user.photoURL || "default-avatar.png";

        if (commentUsernameEl) commentUsernameEl.textContent = displayName;
        if (commentAvatarEl) commentAvatarEl.src = photoURL;

    } else {
        // Utilisateur non connecté
        if (loginToCommentMessage) loginToCommentMessage.style.display = "block";
        if (commentBoxContainer) commentBoxContainer.style.visibility = "hidden";
    }
});



const textarea = document.querySelector('.comment-content textarea');
const commentButtons = document.getElementById('commentButtons');
const cancelBtn = document.getElementById('cancelBtn');

textarea.addEventListener('focus', () => {
  commentButtons.style.display = 'flex';
});

textarea.addEventListener('blur', () => {
  // Si textarea vide, cacher les boutons
  if (textarea.value.trim() === '') {
    commentButtons.style.display = 'none';
  }
});

// Annuler le commentaire
cancelBtn.addEventListener('click', () => {
  textarea.value = '';
  commentButtons.style.display = 'none';
});



submitBtn.addEventListener('click', async () => {
  const text = textarea.value.trim();
  if (!text) return;

  // --- BLACKLIST MOTS INTERDITS ---
  const forbiddenWords = [
    "putain", "connard", "salope", "enculé", "pute", 
    "pd", "pédé", "fdp", "bite", "couille", "salaud", "bouffon",
    "ptn", "seins", "anus", "salop", "enfoiré",
  ];

  const forbiddenWordsRegex = new RegExp(`\\b(${forbiddenWords.join('|')})\\b`, 'i');
  if (forbiddenWordsRegex.test(text)) {
    showToast("Votre commentaire contient des mots interdits !", 4000);
    return;
  }

  // --- BLACKLIST LIENS ---
  const linkRegex = /\b(?:https?:\/\/|www\.)[^\s]+|\b\S+\.(com|net|org|fr|info|io|xyz|gov|edu|co|us|eu)\b/i;
  if (linkRegex.test(text)) {
    showToast("Les liens ne sont pas autorisés dans les commentaires !", 4000);
    return;
  }

  const user = auth.currentUser;
  if (!user) return alert("Vous devez être connecté pour commenter.");

  try {
    await addDoc(collection(db, "comments", movieTitle, "comments"), {
      userId: user.uid,
      text,
      timestamp: new Date()
    });

    textarea.value = '';
    commentButtons.style.display = 'none';
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
  }
});




if (movieTitle) {
  const commentsQuery = query(
    collection(db, "comments", movieTitle, "comments"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(commentsQuery, async (snapshot) => {
    commentsList.innerHTML = "";
    const currentUser = auth.currentUser;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const timestamp = data.timestamp?.toDate
        ? data.timestamp.toDate()
        : new Date(data.timestamp);

      let username = "Utilisateur";
      let photoURL = "default-avatar.png";

      try {
        const userDoc = await getDoc(doc(db, "users", data.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          username = userData.nomUtilisateur || username;
          photoURL = userData.photoURL || photoURL;
        }
      } catch (err) {
        console.error(err);
      }

      const isOwner = currentUser && currentUser.uid === data.userId;

const div = document.createElement("div");
div.className = "comment-item";

div.innerHTML = `
  <img class="comment-avatar" src="${photoURL}">
  <div class="comment-text">
    <div class="username-time">
      <span class="username">${username}</span>
      <span class="comment-time">${timeAgo(timestamp)}</span>
    </div>

    <p>${data.text}</p>

    <div class="comment-actions">
      <button class="reply-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16">
          <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"></path>
        </svg>
        Répondre
      </button>

      <div class="more-wrapper">
        <button class="more-btn" aria-label="Plus d’options">
          <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-testid="MoreVertOutlinedIcon" class="svg-icon" height="1em" width="1em" fill="white">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
          </svg>
          <span class="more-text">Plus</span>
        </button>

        <div class="more-menu" style="display:none;">
          ${isOwner 
            ? `<button class="delete-comment">Supprimer</button>` 
            : `<button class="report-comment">Signaler</button>`}
        </div>
      </div>
    </div>
  </div>
`;

function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const msg = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    msg.textContent = message;
    modal.style.display = "flex";

    function cleanUp() {
      modal.style.display = "none";
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
    }

    function onYes() { cleanUp(); resolve(true); }
    function onNo() { cleanUp(); resolve(false); }

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}


      commentsList.appendChild(div);

      // ----- MENU "PLUS" AU CLIC -----
const moreBtn = div.querySelector(".more-btn");
const menu = div.querySelector(".more-menu");

moreBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelectorAll(".more-menu").forEach(m => {
    if (m !== menu) m.style.display = "none";
  });
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

if (isOwner) {
  const deleteBtn = div.querySelector(".delete-comment");
  deleteBtn.addEventListener("click", async () => {
    const confirmed = await showConfirm("Supprimer ce commentaire ?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "comments", movieTitle, "comments", docSnap.id));
      showToast("Commentaire supprimé !");
    } catch (err) {
      console.error("Erreur suppression commentaire :", err);
      showToast("Erreur lors de la suppression", 4000);
    }
  });
} else {
  const reportBtn = div.querySelector(".report-comment");
reportBtn.addEventListener("click", async () => {
  const confirmed = await showConfirm("Signaler ce commentaire ?");
  if (!confirmed) return;

  const user = auth.currentUser;
  if (!user) return alert("Vous devez être connecté pour signaler un commentaire.");

  try {
    const reportRef = doc(db, "reported-comments", docSnap.id); // utiliser l'ID du commentaire

    const reportSnap = await getDoc(reportRef);

    if (reportSnap.exists()) {
      // Si le commentaire est déjà signalé
      const dataReport = reportSnap.data();
      if (dataReport.reportedBy.includes(user.uid)) {
        showToast("Vous avez déjà signalé ce commentaire.", 4000);
        return;
      } else {
        // Ajouter l'utilisateur au tableau reportedBy
        await setDoc(reportRef, {
          ...dataReport,
          reportedBy: [...dataReport.reportedBy, user.uid],
          timestamp: serverTimestamp()
        });
      }
    } else {
      // Créer le signalement pour la première fois
      await setDoc(reportRef, {
        movieTitle: movieTitle,
        commentAuthorId: data.userId,
        commentText: data.text,
        reportedBy: [user.uid],
        timestamp: serverTimestamp()
      });
    }

    showToast("Commentaire signalé !");
  } catch (err) {
    console.error("Erreur lors du signalement :", err);
    showToast("Erreur lors du signalement", 4000);
  }
});

}

    }
  });
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}


// Fermer les menus si clic ailleurs
document.addEventListener("click", () => {
  document.querySelectorAll(".more-menu").forEach(menu => {
    menu.style.display = "none";
  });
});




function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}




// ---------------------- GÉNÉRATION DU TABLEAU DE TÉLÉCHARGEMENTS ----------------------
const downloadsBody = document.getElementById("downloadsTableBody");

if (downloadsBody && Array.isArray(selectedMovie.downloads)) {
  downloadsBody.innerHTML = ""; // vider le tbody avant de remplir

  selectedMovie.downloads.forEach(dl => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${dl.size || "--"}</td>
      <td>${dl.quality || "--"}</td>
      <td>${dl.resolution || "--"}</td>
      <td>
        <div class="table-button-container">
          <a href="${dl.url}" target="_blank" class="download-btn">Télécharger</a>
        </div>
      </td>
    `;

    downloadsBody.appendChild(tr);
  });
}

if (favoriteBtn && selectedMovie) {

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      favoriteBtn.style.display = "none";
      return;
    }

    const favRef = doc(db, "users", user.uid, "favorites", selectedMovie.title);

    async function updateButton() {
      const exists = await getDoc(favRef);
      if (exists.exists()) {
        favoriteBtn.textContent = "⭐ Retirer des favoris";
        favoriteBtn.classList.add("active");
      } else {
        favoriteBtn.textContent = "⭐ Ajouter aux favoris";
        favoriteBtn.classList.remove("active");
      }
    }

    favoriteBtn.addEventListener("click", async () => {
      const snap = await getDoc(favRef);

      if (snap.exists()) {
        // ❌ SUPPRESSION
        await deleteDoc(favRef);
        showToast("Retiré des favoris");
      } else {
        // ✅ AJOUT
const data = {
  title: selectedMovie.title,
  img: selectedMovie.img,
  resolution: selectedMovie.downloads?.[0]?.resolution || ""
};

if (selectedMovie.type === "serie") {
  data.type = "serie";
}

await setDoc(favRef, {
  ...data,
  createdAt: serverTimestamp()
});

        showToast("Ajouté aux favoris ❤️");
      }

      updateButton();
    });

    updateButton();
  });
}



async function isFavoriteFirestore(userId, title) {
  const favRef = doc(db, "users", userId, "favorites", title);
  const snap = await getDoc(favRef);
  return snap.exists();
}
