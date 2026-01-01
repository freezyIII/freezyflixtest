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

function showImage(event, index) {
    event.stopPropagation(); // Empêche toggleAide d'être déclenché
    const imageDiv = document.getElementById(`aide-image-${index}`);
    if (imageDiv.style.display === "none") {
        imageDiv.style.display = "block";
    } else {
        imageDiv.style.display = "none";
    }
}
