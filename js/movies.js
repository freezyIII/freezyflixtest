// js/movies.js
const movies = [
  {
    title: "Le Hobbit : la bataille des cinq armées",
    category: "Action / Aventure / Fantasy / Drame / Guerre",
    youtubeUrl: "https://www.youtube.com/embed/E5qN3zUF3Rw",
    releaseDate: "10 décembre 2014",
    duration: "2h24",
    size: "66,40 GB",
    downloadUrl: "https://www.clictune.com/lXnX",
    description: "Atteignant enfin la Montagne Solitaire, Thorin et les Nains, aidés par Bilbon le Hobbit, ont réussi à récupérer leur royaume et leur trésor. Ils ont également réveillé le dragon Smaug qui déchaîne désormais sa colère sur les habitants de Lac-ville. À présent, les Nains, les Elfes, les Humains mais aussi les Wrags et les Orques menés par le Nécromancien, convoitent les richesses de la Montagne Solitaire.",
    img: "https://i.imgur.com/Ajc8tVB.png",
    resolution: "4K",
    year: 2014,
    type: "film"
  },
  {
    title: "Gladiator",
    category: "Action / Aventure / Drame",
    youtubeUrl: "https://www.youtube.com/embed/ChcgxBAzrks",
    releaseDate: "20 juin 2000",
    duration: "2h35",
    size: "29,29 GB",
    downloadUrl: "https://www.clictune.com/lXdZ",
    description: "Le général romain Maximus est le plus fidèle soutien de l'empereur Marc Aurèle, qu'il a conduit de victoire en victoire. Jaloux du prestige de Maximus, et plus encore de l'amour que lui voue l'empereur, le fils de Marc Aurèle, Commode, s'arroge brutalement le pouvoir, puis ordonne l'arrestation du général et son exécution. Maximus échappe à ses assassins, mais ne peut empêcher le massacre de sa famille. Capturé par un marchand d'esclaves, il devient gladiateur et prépare sa vengeance.",
    img: "https://i.imgur.com/G6p8KE9.png",
    resolution: "1080p",
    year: 2000,
    type: "film"
  },
  {
    title: "À contre-sens 3",
    category: "Drame / Romance",
    youtubeUrl: "https://youtu.be/2R9wQZzX26A",
    releaseDate: "16 octobre 2025",
    duration: "1h53",
    size: "9,45 GB",
    downloadUrl: "https://www.clictune.com/lWn4",
    description: "Le mariage de Jenna et Lion favorise les retrouvailles tant attendues entre Noah et Nick, quelque temps après leur rupture. L'incapacité de Nick à pardonner à Noah constitue un obstacle insurmontable. Tous deux refusent d'entretenir une flamme qui brûle encore.",
    img: "https://i.imgur.com/FHOrwcK.png",
    resolution: "1080p",
    year: 2025,
    type: "film"
  },
  {
    title: "Les Boxtrolls",
    category: "Action / Animation / Aventure / Fantasy / Comédie / Drame",
    youtubeUrl: "https://www.youtube.com/embed/eJeePQMjBbo",
    releaseDate: "26 septembre 2014",
    duration: "1h36",
    size: "5,87 GB",
    downloadUrl: "https://www.clictune.com/lVcG",
    description: "Coco a été élevé par les Trolls, des êtres gentils et candides qui vivent sous la terre et construisent des machines avec des objets qu'ils trouvent à la surface la nuit venue. Quand le vilain exterminateur Archibald Chasseur décide de tous les kidnapper pour les exploiter afin qu'ils réalisent un projet secret, la population des Trolls diminue considérablement. Coco décide alors de monter à la surface en plein jour afin d'aller confronter le principal responsable de cette extermination.",
    img: "https://i.imgur.com/PJTvWCZ.png",
    resolution: "1080p",
    year: 2014,
    type: "film"
  },
  {
    title: "The Last of Us",
    category: "Action / Aventure / Drame / Horreur / Science-fiction / Thriller",
    youtubeUrl: "https://www.youtube.com/embed/Sh4MVJLUNNY",
    releaseDate: "15 janvier 2023",
    duration: "Variable",
    size: "Variable",
    downloadUrl: "https://www.clictune.com/lUcv",
    description: "Pour Joel, la survie est une préoccupation quotidienne qu'il gère à sa manière. Mais quand son chemin croise celui d'Ellie, leur voyage à travers ce qui reste des États-Unis va mettre à rude épreuve leur humanité et leur volonté de survivre.",
    img: "https://i.imgur.com/GGfHrJS.png",
    resolution: "1080p",
    year: 2023,
    type: "serie"
  },
  {
    title: "Transformers: Rise of the Beasts",
    category: "Action / Aventure / Science-fiction",
    youtubeUrl: "https://www.youtube.com/embed/-to8Qo3ay7Y",
    releaseDate: "9 juin 2023",
    duration: "2h07",
    size: "27,77 GB",
    downloadUrl: "https://www.clictune.com/lQmb",
    description: "Les Decepticons viennent d'arriver sur Terre en 1994, tout comme Optimus Prime, qui existe depuis un peu plus longtemps. L'archéologue Elena et le soldat Noah au Pérou découvrent les traces d'un ancien conflit de transformateurs sur Terre. À l'époque, les Maximals, les Predacons et les Terrorcons s'affrontaient, et ils revinrent à la vie un peu plus tard.",
    img: "https://i.imgur.com/G6hh7pT.png",
    resolution: "1080p",
    year: 2023,
    type: "film"
  },
  {
    title: "Mercredi",
    category: "Aventure / Fantasy / Comédie / Détective / Drame / Horreur / Policier / Science-fiction / Surnaturel / Thriller",
    youtubeUrl: "https://www.youtube.com/embed/iC5DZvNiNpw",
    releaseDate: "23 novembre 2022",
    duration: "Variable",
    size: "Variable",
    downloadUrl: "https://www.clictune.com/lPoc",
    description: "A présent étudiante à la singulière Nevermore Academy, un pensionnat prestigieux pour parias, Wednesday Addams tente de s'adapter auprès des autres élèves tout en enquêtant sur une série de meurtres qui terrorise la ville.",
    backgroundUrl: "https://wallpapers-clan.com/wp-content/uploads/2023/12/wednesday-adams-with-umbrella-purple-desktop-wallpaper-preview.jpg",
    img: "https://i.imgur.com/KNrLHLM.png",
    resolution: "1080p",
    year: 2022,
    type: "serie"
  },
  {
    title: "Five Nights at Freddy's",
    category: "Adaptation cinématographique / Drame / Horreur / Surnaturel / Thriller",
    youtubeUrl: "https://www.youtube.com/embed/iUgc6N37QmU",
    releaseDate: "8 novembre 2023",
    duration: "1h50",
    size: "15,27 GB",
    downloadUrl: "https://www.clictune.com/lPnV",
    description: "Un veilleur de nuit surveille une pizzeria un peu spéciale. Si la journée elle est environnée par de gentilles peluches en animatronics faisant le bonheur des enfants, celles-ci se transforment la nuit en créatures meurtrières. Immobile dans une pièce, il faut surveiller leurs allées et venues via l… PLUS",
    img: "https://i.imgur.com/RmLsy6u.png",
    resolution: "1080p",
    year: 2023,
    type: "film"
  },
  {
    title: "Les Quatre Fantastiques : Premiers Pas",
    category: "Action / Aventure / Fantasy / Comédie / Science-fiction",
    youtubeUrl: "https://www.youtube.com/embed/6MZp-68hYN0",
    releaseDate: "23 juillet 2025",
    duration: "1h55",
    size: "22,30 GB",
    downloadUrl: "https://www.clictune.com/lPnU",
    description: "Dans les années 1960, dans un New York alternatif aux allures rétrofuturiste, l'équipe de super-héros des Quatre Fantastiques fait face à l'arrivée de Galactus, le dévoreur de Mondes.",
    img: "https://i.imgur.com/jBX6jol.png",
    resolution: "4K",
    year: 2025,
    type: "film"
  },
  {
    title: "Zion",
    category: "Aventure / Drame",
    youtubeUrl: "https://www.youtube.com/embed/LTqey1jyiC4",
    releaseDate: "9 avril 2025",
    duration: "1h39",
    size: "4,09 GB",
    downloadUrl: "https://www.clictune.com/lPnT",
    description: "En Guadeloupe, Chris partage son temps entre deals, aventures sans lendemain et rodéos en moto. Repéré par Odell, le caïd du quartier voisin, Chris se voit confier une livraison à risque. Malgré la mise en garde de son meilleur ami, il accepte la mission. Mais le jour de la livraison, il découvre qu'un bébé a été déposé devant sa porte. Commence alors pour lui une course infernale qui le mènera à un choix crucial.",
    img: "https://i.imgur.com/2iiNbqV.png",
    resolution: "1080p",
    year: 2025,
    type: "film"
  }
];

// main.js
// js/main.js
// js/main.js
const movieGrid = document.getElementById("movieGrid");

movies.forEach(movie => {
  const movieDiv = document.createElement("div");
  movieDiv.className = "movie-grid-item";
  movieDiv.setAttribute("data-title", movie.title);

  movieDiv.innerHTML = `
    <a href="movie-details.html?title=${encodeURIComponent(movie.title)}">
      <img src="${movie.img}" loading="lazy">
      <div class="resolution">${movie.resolution}</div>
      ${movie.type === "serie" ? '<div class="serie">Série</div>' : ''}
    </a>
  `;
  movieGrid.appendChild(movieDiv);
});
