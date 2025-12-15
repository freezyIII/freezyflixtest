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
