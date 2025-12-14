document.addEventListener("DOMContentLoaded", () => {

  const randomBox = document.getElementById("random-movie-box");
  if (randomBox) {
    randomBox.addEventListener("click", () => {

      const movies = [];
      document.querySelectorAll(".movie-item a, .movie-grid-item a").forEach(link => {
        const title = new URL(link.href, location.origin).searchParams.get("title");
        if (title) movies.push(title);
      });

      if (!movies.length) {
        alert("Aucun film trouvé");
        return;
      }

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      window.location.href = `movie-details.html?title=${encodeURIComponent(randomMovie)}`;
    });
  }

});
