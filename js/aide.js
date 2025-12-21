function toggleAide(index) {
    const aideItems = document.querySelectorAll('.aide-item');
    aideItems.forEach((item, i) => {
        if (i !== index) item.classList.remove('active');
    });
    aideItems[index].classList.toggle('active');
}

// Empêcher le drag & drop des éléments
document.addEventListener('dragstart', (event) => {
    event.preventDefault();
});
