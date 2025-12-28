document.addEventListener("DOMContentLoaded", () => {
  // -------------------- Variables --------------------
  const randomBox = document.getElementById("random-movie-box");
  const movieGrid = document.getElementById("movieGrid");
  const totalMoviesDiv = document.getElementById("totalMovies");
  const filterBtn = document.getElementById("toggleFilters");
  const filterPanel = document.getElementById("filter-panel");
  const closeBtn = document.getElementById("closeFilters");
  const resetBtn = document.getElementById("reset-filters");
  const searchInput = document.getElementById("search-input");

  const rulesBtn = document.getElementById('rulesBtn');
  const rulesOverlay = document.getElementById('rulesOverlay');
  const closeRules = document.getElementById('closeRules');
  const rulesContent = document.querySelector('.rules-content');

  const header = document.querySelector('header');
  const headerOffset = header.offsetTop;

  // -------------------- Compteur de films --------------------
  window.updateTotalMovies = function () {
    if (movieGrid && totalMoviesDiv) {
      const visibleMovies = movieGrid.querySelectorAll(".movie-grid-item:not([hidden])").length;
      totalMoviesDiv.textContent = `Total de films : ${visibleMovies}`;
    }
  }
  updateTotalMovies();

  // -------------------- Film aléatoire --------------------
  if (randomBox) {
    randomBox.addEventListener("click", () => {
      const movies = Array.from(document.querySelectorAll(".movie-item a, .movie-grid-item a"))
        .map(link => new URL(link.href, location.origin).searchParams.get("title"))
        .filter(Boolean);

      if (movies.length === 0) {
        alert("Aucun film trouvé");
        return;
      }

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      window.location.href = `movie-details.html?title=${encodeURIComponent(randomMovie)}`;
    });
  }

  // -------------------- Filtres --------------------
  if (filterBtn && filterPanel) {
    filterBtn.addEventListener("click", e => {
      e.stopPropagation();
      filterPanel.classList.toggle("active");
    });

    closeBtn?.addEventListener("click", () => filterPanel.classList.remove("active"));

    document.addEventListener("click", e => {
      if (!filterBtn.contains(e.target) && !filterPanel.contains(e.target)) {
        filterPanel.classList.remove("active");
      }
    });

    resetBtn?.addEventListener("click", () => {
      filterPanel.querySelectorAll("select").forEach(select => select.value = "");
      document.querySelectorAll(".movie-grid-item").forEach(movie => movie.hidden = false);
      updateTotalMovies();
    });
  }

  // -------------------- Modal règles / charte --------------------
  function closeModal() {
    rulesOverlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  rulesBtn?.addEventListener('click', () => {
    rulesOverlay.classList.add('open');
    document.body.classList.add('no-scroll');
  });

  closeRules?.addEventListener('click', closeModal);

  rulesOverlay?.addEventListener('click', e => {
    if (e.target === rulesOverlay) closeModal();
  });

  // Scroll drag dans la modal
  let isDown = false, startY, scrollTop;
  rulesContent?.addEventListener('mousedown', e => {
    isDown = true;
    rulesContent.classList.add('active');
    startY = e.pageY - rulesContent.offsetTop;
    scrollTop = rulesContent.scrollTop;
    e.preventDefault();
  });

  rulesContent?.addEventListener('mouseleave', () => {
    isDown = false;
    rulesContent.classList.remove('active');
  });

  rulesContent?.addEventListener('mouseup', () => {
    isDown = false;
    rulesContent.classList.remove('active');
  });

  rulesContent?.addEventListener('mousemove', e => {
    if (!isDown) return;
    const y = e.pageY - rulesContent.offsetTop;
    const walk = (y - startY);
    rulesContent.scrollTop = scrollTop - walk;
  });

  rulesContent?.addEventListener('wheel', e => {
    const atTop = rulesContent.scrollTop === 0;
    const atBottom = rulesContent.scrollHeight - rulesContent.scrollTop === rulesContent.clientHeight;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) e.preventDefault();
  }, { passive: false });

  // -------------------- Initialisation des films (movieGrid) --------------------

if (typeof movies !== "undefined" && movieGrid) {
  movies.forEach(movie => {
    const movieDiv = document.createElement("div");
    movieDiv.className = "movie-grid-item";
    movieDiv.setAttribute("data-title", movie.title);

    const resolution = movie.downloads?.[0]?.resolution || "";

    movieDiv.innerHTML = `
      <a href="movie-details.html?title=${encodeURIComponent(movie.title)}">
        <img src="${movie.img}" loading="lazy">
        ${resolution ? `<div class="resolution">${resolution}</div>` : ''}
        ${movie.type === "serie" ? '<div class="serie">Série</div>' : ''}
      </a>
    `;
    movieGrid.appendChild(movieDiv);
  });

  updateTotalMovies();
}


  // -------------------- Synchronisation data-title pour carousel --------------------
document.querySelectorAll('.movie-item, .movie-grid-item').forEach(item => {
  const link = item.querySelector('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || !href.includes('?')) return;

  const urlParams = new URLSearchParams(href.split('?')[1]);
  const title = urlParams.get('title');

  if (title) {
    item.setAttribute('data-title', decodeURIComponent(title));
  }
});

});


document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q")?.toLowerCase() || "";

    if (query) {
        filterMovies(query);
    }

    function filterMovies(searchText) {
        const movieGrid = document.getElementById("movieGrid");
        if (!movieGrid) return;

        const movies = movieGrid.querySelectorAll(".movie-grid-item");
        movies.forEach(movie => {
            const title = movie.getAttribute("data-title")?.toLowerCase() || "";
            if (title.includes(searchText)) {
                movie.hidden = false;
            } else {
                movie.hidden = true;
            }
        });

        // Mettre à jour le compteur
        const totalMoviesDiv = document.getElementById("totalMovies");
        if (totalMoviesDiv) {
            const visibleMovies = movieGrid.querySelectorAll(".movie-grid-item:not([hidden])").length;
            totalMoviesDiv.textContent = `Total de films : ${visibleMovies}`;
        }
    }
});
