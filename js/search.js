document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname; // ex: /search/Minecraft
  const query = decodeURIComponent(path.split("/search/")[1] || "");

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = query;

  function normalizeString(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const normalizedQuery = normalizeString(query);

  document.querySelectorAll('.movie-grid-item').forEach(item => {
    const title = normalizeString(item.getAttribute('data-title') || '');
    item.hidden = !title.includes(normalizedQuery);
  });
});
