Livraison pour Lovable

Contenu:
- src/pages/AiHub.tsx : ajout d'une bannière vidéo en haut de la page AI Hub
- src/assets/video_banner_compressed.mp4 : vidéo compressée pour usage web

Détails techniques :
- La vidéo est insérée avec `autoplay`, `loop`, `playsInline` et `controls`.
- Le code tente de lancer la lecture automatiquement via une référence JS; les navigateurs peuvent bloquer l'autoplay avec son tant qu'il n'y a pas d'interaction utilisateur.

Pour tester localement :
1. Installer les dépendances et lancer le projet (ex: `npm install && npm run dev`).
2. Ouvrir `/ai-hub`.

Fichiers inclus dans l'archive: `AiHub.tsx`, `video_banner_compressed.mp4`.

Si vous voulez que la vidéo démarre toujours automatiquement sans interaction, indiquez si l'on peut la mettre en `muted` ou ajouter un contrôle de lecture programmatique côté serveur/client.
