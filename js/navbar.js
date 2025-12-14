import { auth, provider, signInWithPopup, signOut, db } from './database.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-firestore.js";

// Elements DOM
const loginBtn = document.getElementById('loginBtn');
const userPseudo = document.getElementById('userPseudo');
const profileMenuContainer = document.getElementById('profileMenuContainer');
const profileAvatar = document.getElementById('profileAvatar');
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
    userPseudo.textContent = user.displayName;
    if (user.photoURL) profileAvatar.src = user.photoURL; // affiche l'avatar seulement s'il existe
    userPseudo.style.display = 'inline-block';
    profileMenuContainer.style.display = 'flex';
    loginBtn.style.display = 'none';
}

// Cache l'utilisateur déconnecté
function hideUser() {
    userPseudo.style.display = 'none';
    profileMenuContainer.style.display = 'none';
    profileAvatar.removeAttribute('src'); // supprime l'image si déconnecté
    loginBtn.style.display = 'inline-block';
}

// Vérifie si l'utilisateur est déjà connecté
auth.onAuthStateChanged(async user => {
    if (user) {
        showUser(user);

        // Récupérer ou créer le document Firestore
        const userDocRef = doc(db, "utilisateurs", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            const maintenant = new Date();
            await setDoc(userDocRef, {
                nomUtilisateur: user.displayName,
                mail: user.email,
                imageProfil: user.photoURL || null, // null si pas d'image
                dateCreation: formatDate(maintenant)
            });
            console.log("Utilisateur ajouté à Firestore !");
        }
    } else {
        hideUser();
    }
});

// Connexion Google
loginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        showUser(user);
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
profileAvatar.addEventListener('click', () => {
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

// click catégories
document.getElementById('categories-link').onclick = e => {
  e.preventDefault();
  document.querySelector('.content').style.display = 'none';
  document.getElementById('random-movie-box').parentElement.style.display = 'none';
  document.querySelector('.movie-grid-section').style.display = '';
  document.getElementById('filter-panel').style.display = '';
  document.querySelectorAll('.movie-grid-item').forEach(m => m.style.display = '');
  document.getElementById('search-input').value = '';
  localStorage.removeItem('searchQuery');
  resetFilters();
};

// Ajout data-title pour chaque film à partir du paramètre URL "title"
document.querySelectorAll('.movie-grid-item, .movie-item').forEach(item => {
  const link = item.querySelector('a');
  if (!link) return;
  const title = new URL(link.href, location.origin).searchParams.get('title');
  if (title) item.dataset.title = title;
});





// Fonction pour retirer les accents
const removeAccents = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Fonction pour afficher/masquer les films selon la recherche texte
function filterBySearch() {
  const search = removeAccents(document.getElementById('search-input').value.trim().toLowerCase());
  const movies = document.querySelectorAll('.movie-grid-item');
  const sections = {
    featured: document.querySelector('.content'),
    random: document.getElementById('random-movie-box').parentElement,
    discover: document.querySelector('.movie-grid-section')
  };

  document.getElementById('filter-panel').style.display = 'none';

  if (!search) {
    localStorage.removeItem('searchQuery');
    movies.forEach(m => m.style.display = '');
    Object.values(sections).forEach(s => s.style.display = '');
    return;
  }

  localStorage.setItem('searchQuery', search);
  let countVisible = 0;
  movies.forEach(m => {
    const title = removeAccents((m.dataset.title || '').toLowerCase());
    const match = title.includes(search);
    m.style.display = match ? '' : 'none';
    if (match) countVisible++;
  });

  sections.featured.style.display = 'none';
  sections.random.style.display = 'none';
  sections.discover.style.display = countVisible ? '' : 'none';
}

// Filtrage par catégories, année, qualité

function filterMovies() {
  const category = document.getElementById('category-filter').value.toLowerCase();
  const year = document.getElementById('year-filter').value;
  const quality = document.getElementById('quality-filter').value;
  const type = document.getElementById('type-filter').value.toLowerCase();

  document.querySelectorAll('.movie-grid-item').forEach(item => {
    const categories = (item.getAttribute('category') || '').toLowerCase().split(' / ').map(c => c.trim());
    const itemYear = item.dataset.year || '';
    const resolution = item.querySelector('.resolution')?.textContent.trim() || '';
    const itemType = (item.dataset.type || '').toLowerCase();

    const show = 
      (!category || categories.includes(category)) &&
      (year === 'all' || itemYear === year) &&
      (!quality || resolution === quality) &&
      (!type || itemType === type);

    item.style.display = show ? '' : 'none';
  });
}


// Réinitialisation des filtres
function resetFilters() {
  document.getElementById('category-filter').value = '';
  document.getElementById('year-filter').value = 'all';
  document.getElementById('quality-filter').value = '';
  document.getElementById('type-filter').value = '';
  filterMovies();
}


// Événements
document.querySelector('.search-icon').onclick = filterBySearch;
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') filterBySearch();
});

document.getElementById('random-movie-box').onclick = () => {
  const links = [...document.querySelectorAll('.movie-item a, .movie-grid-item a')];
  if (!links.length) return;
  window.location.href = links[Math.floor(Math.random() * links.length)].href;
};



['category-filter', 'year-filter', 'quality-filter'].forEach(id => {
  document.getElementById(id).addEventListener('change', filterMovies);
});

document.getElementById('reset-filters').onclick = resetFilters;

document.getElementById('search-input').addEventListener('focus', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('load', () => {
  document.getElementById('filter-panel').style.display = 'none';

  if (location.hash === '#categories') {
    document.getElementById('categories-link').click();
  }
});

document.getElementById('categories-link').addEventListener('click', function(event) {
  event.preventDefault();

  const filterPanel = document.getElementById('filter-panel');
  
  if (filterPanel.style.display === 'none' || filterPanel.style.display === '') {
    filterPanel.style.display = 'flex';
  } else {
    filterPanel.style.display = 'none';
  }
});

