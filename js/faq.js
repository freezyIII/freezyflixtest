async function loadNavbar() {
  const response = await fetch('navbar.html');
  const data = await response.text();
  document.getElementById('navbar').innerHTML = data;
}

loadNavbar();



function toggleFAQ(index) {
    const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach((item, i) => {
        if (i !== index) item.classList.remove('active');
      });
      faqItems[index].classList.toggle('active');
    }
    document.addEventListener('dragstart', (event) => {
  event.preventDefault();
});


