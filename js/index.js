document.addEventListener("DOMContentLoaded", () => {
  const randomBox = document.getElementById("random-movie-box");

  if (randomBox) {
    randomBox.addEventListener("click", () => {
      const movies = [];
      document.querySelectorAll(".movie-item a, .movie-grid-item a").forEach(link => {
        const title = new URL(link.href, location.origin).searchParams.get("title");
        if (title) movies.push(title);
      });

      if (movies.length === 0) {
        alert("Aucun film trouvé");
        return;
      }

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      window.location.href = `movie-details.html?title=${encodeURIComponent(randomMovie)}`;
    });
  }

  const filterBtn = document.getElementById("toggleFilters");
  const filterPanel = document.getElementById("filter-panel");
  const closeBtn = document.getElementById("closeFilters");
  const resetBtn = document.getElementById("reset-filters");

  if (filterBtn && filterPanel) {
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterPanel.classList.toggle("active");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        filterPanel.classList.remove("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (!filterBtn.contains(e.target) && !filterPanel.contains(e.target)) {
        filterPanel.classList.remove("active");
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        filterPanel.querySelectorAll("select").forEach(select => select.value = "");
      });
    }
  }
});
