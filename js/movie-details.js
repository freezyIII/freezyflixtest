const urlParams = new URLSearchParams(window.location.search);
const movieTitle = urlParams.get('title');

// Récupération du film depuis movies.js
const selectedMovie = movies.find(movie => movie.title === movieTitle);

if (selectedMovie) {
  // Affichage des infos
  document.getElementById('movieTitle').textContent = selectedMovie.title;
  document.getElementById('movieCategoryText').textContent = selectedMovie.category;
  document.getElementById('movieDescription').textContent = selectedMovie.description;
  document.getElementById('releaseDateValue').textContent = selectedMovie.releaseDate;
  document.getElementById('durationValue').textContent = selectedMovie.duration;
  document.getElementById('sizeValue').textContent = selectedMovie.size;

  // Fond personnalisé si défini
  if (selectedMovie.backgroundUrl) {
    document.body.style.background = `url('${selectedMovie.backgroundUrl}') no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
  }

  // Bouton téléchargement vert
  const downloadBtn = document.getElementById('downloadButton');
  const forbiddenTitles = [
    "Batman v Superman : L'Aube de la justice",
    "Man of Steel"
  ];

  if (downloadBtn && forbiddenTitles.includes(selectedMovie.title)) {
    downloadBtn.remove();
  } else if (downloadBtn) {
    downloadBtn.textContent = 'Télécharger';
    downloadBtn.onclick = () => window.open(selectedMovie.downloadUrl, '_blank');
  }

  // Boutons dorés (qualité maximale)
  const goldButtons = {
    "Ad Astra": { url: "https://www.clictune.com/kxjS", size: "48,12 GB" },
    "Interstellar": { url: "https://www.clictune.com/kxkj", size: "73,40 GB" },
    "Le Hobbit: La désolation de Smaug": { url: "https://www.clictune.com/kxvU", size: "94,71 GB" },
    "Batman v Superman : L'Aube de la justice": { url: "https://www.clictune.com/lg9Y" },
    "Man of Steel": { url: "https://www.clictune.com/lg9X" }
  };

  if (goldButtons[selectedMovie.title]) {
    const { url, size } = goldButtons[selectedMovie.title];
    const goldenBtn = document.createElement('button');
    goldenBtn.textContent = size ? `Télécharger qualité maximum ${size}` : "Télécharger qualité maximum";
    goldenBtn.className = 'gold-button';
    goldenBtn.onclick = () => window.open(url, '_blank');
    document.querySelector('.container').appendChild(goldenBtn);
  }

  // Affichage uniquement de la vidéo YouTube
  if (selectedMovie.youtubeUrl) {
    document.getElementById('movieIframeContainer').innerHTML = `
        <iframe 
            src="${selectedMovie.youtubeUrl}" 
            width="800" 
            height="450" 
            frameborder="0" 
            allowfullscreen
            style="border-radius:20px 20px 0 0; object-fit:cover;">
        </iframe>
    `;
  }
} // <-- fermeture du if(selectedMovie)
