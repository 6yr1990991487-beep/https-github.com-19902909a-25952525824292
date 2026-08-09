export const trainAnnouncements = [
  {
    id: 'arrival-paris-voie-1',
    type: 'arrival',
    text: 'Le TGV 8541 à destination de Paris Gare de Lyon entre en gare voie 1. Éloignez-vous de la bordure du quai.',
    audioSrc: '/audio/train-announcements/arrival-paris-voie-1.mp3',
    displayMs: 9000,
  },
  {
    id: 'arrival-marseille-voie-3',
    type: 'arrival',
    text: 'Mesdames et messieurs, le TGV 6723 en provenance de Marseille Saint-Charles arrive voie 3.',
    audioSrc: '/audio/train-announcements/arrival-marseille-voie-3.mp3',
    displayMs: 8500,
  },
  {
    id: 'departure-bordeaux-voie-2',
    type: 'departure',
    text: 'Attention au départ. Le TGV 9834 à destination de Bordeaux Saint-Jean va partir voie 2.',
    audioSrc: '/audio/train-announcements/departure-bordeaux-voie-2.mp3',
    displayMs: 8500,
  },
  {
    id: 'info-retard-lyon',
    type: 'info',
    text: 'Le train régional TER 847621 à destination de Lyon Part-Dieu est annoncé avec un retard de 5 minutes.',
    audioSrc: '/audio/train-announcements/info-retard-lyon.mp3',
    displayMs: 9000,
  },
  {
    id: 'arrival-lille-voie-4',
    type: 'arrival',
    text: "Votre attention s'il vous plaît. Le TGV INOUI 6891 à destination de Lille Europe entre en gare voie 4.",
    audioSrc: '/audio/train-announcements/arrival-lille-voie-4.mp3',
    displayMs: 9000,
  },
  {
    id: 'info-bienvenue-nlln',
    type: 'info',
    text: 'Bienvenue à bord du réseau ÑLLÑ. Nous vous souhaitons un agréable voyage.',
    audioSrc: '/audio/train-announcements/info-bienvenue-nlln.mp3',
    displayMs: 8000,
  },
];

export const getTrainAnnouncementsByType = (type) => {
  if (!type) {
    return trainAnnouncements;
  }

  return trainAnnouncements.filter((announcement) => announcement.type === type);
};

export const getRandomTrainAnnouncement = (type) => {
  const pool = getTrainAnnouncementsByType(type);
  if (!pool.length) {
    return trainAnnouncements[0] ?? null;
  }

  return pool[Math.floor(Math.random() * pool.length)];
};