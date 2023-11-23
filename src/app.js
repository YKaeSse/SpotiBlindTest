// server.js
const express = require('express');
const path = require('path');

const app = express();

// Définir le dossier des fichiers de développement
//app.use(express.static(path.join(__dirname, 'dist/inst-api')));

// Redirection de toutes les requêtes vers le fichier index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrez le serveur sur le port de votre choix
const port = 3007;
app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});