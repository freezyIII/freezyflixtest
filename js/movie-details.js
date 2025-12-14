async function loadNavbar() {
  const response = await fetch('navbar.html');
  const data = await response.text();
  document.getElementById('navbar').innerHTML = data;
}

loadNavbar();