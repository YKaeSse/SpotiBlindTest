# Présentation

SpotiBlindTest est le site qu'il vous faut pour vous challenger sur vos connaissances de vos musique Spotify.

Le concept est simple :

Choisissez une de vos playlists parmis votre bibliothèque et défiez vous sur un BlindTest inoubliable.

La connexion à votre compte permet de pouvoir vous afficher vos playlists même celles privées.

Rassurez-vous, seul vous et vous même avez accès a ces informations.

Amusez-vous bien sur SpotiBlindTest !


# Utilisation

SpotiBlindTest utilise plusieurs frameworks :
- [Angular](https://angular.io/)

## Installation

Installer tous les packages nécessaires

```bash
npm install
```

## Usage
On a besoin de lancer le localhost pour lancer le projet.
Utiliser la commande suivante.

```bash
ng serve
```
Apres ca lancer un navigateur et ouvrir le localhost indiqué par la commande précédente.

## Erreur possible

Il est possible que les playlists ne veuillent pas s'afficher sur la page d'accueil.

Dans ce cas là, c'est que votre adresse email spotify n'est pas dans les compte autorisé pour utiliser l'api. Contacter nous afin de changer ou d'ajouter l'adresse email correspondant à votre compte.

## Ajouter un service 


pour ajouter le service au pc pour que ca redemarre en boucle on fait :

sudo cp spotiblindtest.service /etc/systemd/system/spotiblindtest.service
sudo systemctl daemon-reload
sudo systemctl enable spotiblindtest.service
sudo systemctl start spotiblindtest.service


pour checker l'etat de spotiblindtest on fait :
sudo systemctl status spotiblindtest.service


si on veut relancer ou stopper il y a : 

sudo sytemctl restart spotiblindtest.service
sudo systemctl stop spotiblindtest.service
