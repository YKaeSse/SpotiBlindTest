// server.js
const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();

// Use the history API fallback middleware
app.use(history());


// Définir le dossier des fichiers de développement
app.use(express.static(path.join(__dirname, 'src')));

// Redirection de toutes les requêtes vers le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Démarrez le serveur sur le port de votre choix
const port = 3006;
app.listen(port, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
