function commonsImage(fileName) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1600`;
}

function commonsSource(fileName) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName).replace(/%20/g, "_")}`;
}

export const LANDMARK_SLIDES = [
  {
    title: "Torre Eiffel",
    location: "París, Francia",
    image: commonsImage("Eiffel_Tower_from_the_Tour_Montparnasse_1,_Paris_May_2014.jpg"),
    sourceUrl: commonsSource("Eiffel_Tower_from_the_Tour_Montparnasse_1,_Paris_May_2014.jpg"),
    position: "50% 42%",
  },
  {
    title: "Gran Muralla China",
    location: "Mutianyu, China",
    image: commonsImage("Great_Wall_of_China,_Mutianyu_Section.jpg"),
    sourceUrl: commonsSource("Great_Wall_of_China,_Mutianyu_Section.jpg"),
    position: "50% 45%",
  },
  {
    title: "Machu Picchu",
    location: "Cusco, Perú",
    image: commonsImage("Peru_Machu_Picchu.jpg"),
    sourceUrl: commonsSource("Peru_Machu_Picchu.jpg"),
    position: "50% 42%",
  },
  {
    title: "Taj Mahal",
    location: "Agra, India",
    image: commonsImage("Taj_Mahal,_Agra,_India.jpg"),
    sourceUrl: commonsSource("Taj_Mahal,_Agra,_India.jpg"),
    position: "50% 47%",
  },
  {
    title: "Big Ben",
    location: "Londres, Reino Unido",
    image: commonsImage("Big_Ben_Elizabeth_Tower_Full_View.JPG"),
    sourceUrl: commonsSource("Big_Ben_Elizabeth_Tower_Full_View.JPG"),
    position: "50% 38%",
  },
  {
    title: "Muro de Berlín",
    location: "Berlín, Alemania",
    image: commonsImage("Berlin_Wall_-_East_Side_Gallery_(15758594025).jpg"),
    sourceUrl: commonsSource("Berlin_Wall_-_East_Side_Gallery_(15758594025).jpg"),
    position: "50% 48%",
  },
  {
    title: "Coliseo",
    location: "Roma, Italia",
    image: commonsImage("Colosseum_of_Rome,_Italy.jpg"),
    sourceUrl: commonsSource("Colosseum_of_Rome,_Italy.jpg"),
    position: "50% 46%",
  },
  {
    title: "Pirámides de Giza",
    location: "Giza, Egipto",
    image: commonsImage("Pyramids_of_Giza.jpg"),
    sourceUrl: commonsSource("Pyramids_of_Giza.jpg"),
    position: "50% 45%",
  },
  {
    title: "Cristo Redentor",
    location: "Río de Janeiro, Brasil",
    image: commonsImage("Christ-Redeemer-Rio-de-Janeiro.jpg"),
    sourceUrl: commonsSource("Christ-Redeemer-Rio-de-Janeiro.jpg"),
    position: "50% 35%",
  },
  {
    title: "Angkor Wat",
    location: "Siem Reap, Camboya",
    image: commonsImage("Angkor_(II).jpg"),
    sourceUrl: commonsSource("Angkor_(II).jpg"),
    position: "50% 48%",
  },
];
