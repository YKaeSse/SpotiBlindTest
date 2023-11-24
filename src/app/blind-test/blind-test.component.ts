import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'console';
import { UnaryFunction } from 'rxjs';

import { ConfigService } from 'src/app/shared/config.service';
import { getPlayable, getPlaylistTracks} from 'src/assets/code/HttpRequest'
import { PlaylistTracks, Track } from 'src/assets/code/ObjectsFormat'


@Component({
  selector: 'app-blind-test',
  templateUrl: './blind-test.component.html',
  styleUrls: ['./blind-test.component.scss']
})
export class BlindTestComponent{
  constructor(private router: Router,
              private configService: ConfigService) {}
  PlayOrPause: string = "bi-play-fill";
  isplayButton : boolean = false;


  musicTrack: string | undefined = undefined;
  audioElement: HTMLAudioElement | undefined;

  currentProgress : number = 0;
  musicLink: string = "";
  //maxDuration: number = 15; // en secondes
  idPlaylist: string | null = "";

  currentMusicName: string | undefined  = undefined;
  currentMusicArtists: string[] | undefined = undefined;
  playlistTracks: PlaylistTracks | null = null;
  totalNumberTracks: number | undefined = 0;
  IsFindSound: boolean = false;
  IsFindArtiste : boolean = false;
  IsAlmostFind : boolean = false;
  IsFindAll: boolean = this.IsFindArtiste && this.IsFindSound;
  usedTracks: number[] = [];

  colorArtist: string = "gray";
  colorTitle: string = "gray";
  Artist: string = "Artist : ?";
  Title: string = "Title : ?";

  items: any[] = []; // Déclaration du tableau de données

  actualMusic: Track | undefined = undefined;
  async ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    this.idPlaylist = urlParams.get('id');
    // si pas d'id redirige vers la home
    if (!this.idPlaylist)
    {
      this.stopMusic();
      this.router.navigate(['/home']);
      return;
    }
    else
    {
      const {tracks, totalTrack} = await getPlaylistTracks(this.configService.access_token, this.idPlaylist);
      this.playlistTracks = tracks
      this.totalNumberTracks = totalTrack || 0;
      this.configService.totalTracks = this.playlistTracks?.items.length || 0;
      this.configService.playedTracks = [];
      console.log(this.playlistTracks)
    }

    if (this.totalNumberTracks === 0)
    {
      throw new Error("La playlist choisit est vide");
    }

    await this.nextMusic(true);

    const input = document.getElementById('InputMusic');
      if (input)
      {
        input.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            // Appeler la fonction souhaitée ici
            this.findMusic();
          }
        });
      }
  }


  findMusic(): void {
    let input = document.getElementById('InputMusic') as HTMLInputElement;
    let value: string = input.value.trim().toLowerCase();
    this.IsAlmostFind = false;
    let DesactivePresque = false;
    if (!value || !input.value || input.value === "") {
      return;
    }

    console.log(value);

    // Comparer avec this.currentMusicName
    if (!this.IsFindSound && this.currentMusicName && this.isStringSimilar(this.currentMusicName.toLowerCase(), value, 0.75)) {
      this.IsFindSound = true;
      this.Title = this.currentMusicName;
      this.colorTitle = "green";
      DesactivePresque = true;
    }

    // Comparer avec this.currentMusicArtists
    if (!this.IsFindArtiste && this.currentMusicArtists) {
      for (let artist of this.currentMusicArtists) {
        if (this.isStringSimilar(artist.toLowerCase(), value, 0.70)) {
          this.IsFindArtiste = true;
          DesactivePresque = true;
          this.Artist =  artist;
          this.colorArtist = "green";
          break;
        }
      }
    }

    // Afficher un message si la valeur entrée est proche
    console.log(DesactivePresque)
    let presqueArtist = false;
    if (!this.IsFindArtiste && this.currentMusicArtists) {
      for (let artist of this.currentMusicArtists) {
        if (this.isStringSimilar(artist.toLowerCase(), value, 0.70)) {
          presqueArtist = true
        }
      }
    }
    if (DesactivePresque === false ) {
      if (!this.IsFindSound  && this.currentMusicName && this.isStringSimilar(this.currentMusicName.toLowerCase(), value, 0.70)|| presqueArtist)
      {
        this.IsAlmostFind = true;
        console.log("Presque !!")
      }
    }

    input.value = "";
    this.IsFindAll = this.IsFindArtiste && this.IsFindSound;
  }

  isStringSimilar(a: string, b: string, taux: number): boolean {
    // Supprimer les espaces et les caractères spéciaux
    const normalizedA = a.replace(/\s/g, "").replace(/[^\w\s]|_/g, "").toLowerCase();
    const normalizedB = b.replace(/\s/g, "").replace(/[^\w\s]|_/g, "").toLowerCase();

    // Vérifier si les chaînes de caractères sont similaires
    const levenshteinDistance = this.calculateLevenshteinDistance(normalizedA, normalizedB);
    const similarityPercentage = 1 - levenshteinDistance / Math.max(normalizedA.length, normalizedB.length);
    const similarityThreshold = taux; // Ajuster le seuil de similarité plus c eleve plus c stricte

    return similarityPercentage >= similarityThreshold;
  }

  calculateLevenshteinDistance(a: string, b: string): number {
    const matrix = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }


  updateProgress() {
    const currentTime = this.audioElement?.currentTime;
    const duration = this.audioElement?.duration;
    if (currentTime && duration) {
      this.currentProgress = (currentTime /  duration) * 100;
      /*if (currentTime >= this.maxDuration)
      {
        //this.stopMusic();
        this.nextMusic();
      }*/
    }

  }

  togglePlayPause(): void {

    if (!this.isplayButton) {
      this.PlayOrPause = "bi-pause";
      this.isplayButton = true;
      this.playMusic();
    }
    else
    {
      this.PlayOrPause = "bi-play-fill";
      this.isplayButton = false;
      this.pauseMusic();
    }
    this.updateProgress();
  }

  async getMusicPlayable() : Promise<Track | undefined> {
    if (this.musicTrack === undefined)
    {
      this.stopMusic();
      this.router.navigate(['/home']);
      return undefined;
    }
    else
    {
      let SoloTrack : Track = await getPlayable(this.configService.access_token, this.musicTrack);
      let music : string = SoloTrack.preview_url;
      return SoloTrack;
    }
  }

  async playMusic() {
    if (this.audioElement) {
      try {
        this.audioElement.play();
      } catch (error) {
        console.error("playMusic(): Error when trying to play music ")
        this.nextMusic();
      }
      
    }
  }

  async nextMusic(firstLaunch: boolean = false) {
    
    if (this.actualMusic !== undefined)
    {
      this.items.unshift({
        songUrl: this.actualMusic.external_urls.spotify,
        imagePath:  this.actualMusic.album.images[0].url,
        MusicName: this.actualMusic.name,
        ArtistName: this.actualMusic.artists[0].name
      });
    }
    if (!firstLaunch)
    {
      this.musicEnd();
      this.stopMusic();
    }
    this.IsFindAll = false;
    this.IsFindSound = false;
    this.IsFindArtiste = false;
    this.IsAlmostFind = false;

    // on doit gerer si c'est out of range
    if (this.totalNumberTracks && this.configService.actualNumber >= this.totalNumberTracks )
    {
      // fin de la playlist
      // TODO mettre un message d'info sur l'ecran que la playlist est finit 
      this.router.navigate(['/home']);
      return;
    }

    if (this.playlistTracks && this.usedTracks.length === this.playlistTracks.items.length) {
      // Toutes les pistes ont été jouées, réinitialiser la liste des pistes utilisées
      this.usedTracks = [];
      this.configService.actualNumber = 0; // Réinitialiser la valeur de actualNumber
    }

    let randomIndex = Math.floor(Math.random() * (this.playlistTracks ? this.playlistTracks?.items.length : 0));
    while (this.usedTracks.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * (this.playlistTracks ? this.playlistTracks.items.length : 0));
    }
    this.usedTracks.push(randomIndex)
    // recuperer la musique suivante de la playlist
    /// changer le this.audioElement son id
    this.musicTrack = this.playlistTracks?.items[randomIndex].track.id;
    this.currentMusicName =  this.playlistTracks?.items[randomIndex].track.name;

    // remove - and ( because he change the name of music and we don't find it
    // ex : coucou - COLOR SHOW -> coucou ou Salut (feat. Nekfeu) -> Salut
    if (this.currentMusicName)
    {
      for (let i = 0; i < this.currentMusicName.length; i++)
      {
        if (this.currentMusicName[i] === '-' || this.currentMusicName[i] === '(')
        {
          this.currentMusicName = this.currentMusicName.substring(0, i).trim();
          break;
        }
      }
    }

    console.log(this.currentMusicName);

    // charge les artists de la musique en question
    let tmp = this.playlistTracks?.items[randomIndex].track.artists;
    this.currentMusicArtists = undefined;
    if (tmp)
    {
      // TODO pas compris pk ya cette condition si on la set au dessus a undefined
      if (this.currentMusicArtists === undefined)
      {
        this.currentMusicArtists = [];
      }
      for(let n: number = 0; n < tmp?.length; n++)
      {
        this.currentMusicArtists?.push(tmp[n].name);
      }
      console.log(this.currentMusicArtists)
    }
    
    // incrememente la musique
    this.configService.actualNumber += 1;
    // Récupérez l'URL de la musique que vous souhaitez jouer
    this.actualMusic = await this.getMusicPlayable();
    console.log("l.324 actualMusic :", this.actualMusic, " | id de la musique :", this.musicTrack)
    if (this.actualMusic === undefined)
    {
      console.log("je pense que le bug des doubles musiques vients de la, regarder si ca vient de passer deux musiques")
      this.nextMusic();
      return;
    }
    // Créez un nouvel élément audio
    this.audioElement = new Audio(this.actualMusic?.preview_url);
    // En cas d'erreur lors du chargement de la source audio
    // TODO ca me parait bizarre ca -> verifier comment ca marche. Pour moi ca va du tout la, un listener ca se met dans l'initialize ou 
    // dans l'endroit ou on declare audioElement mais dans un fonction qu'on appelle plusiseurs fois c bizarre
    this.audioElement.addEventListener('error', (e) => {
      console.error("Erreur lors du chargement de la source audio", e);
      this.nextMusic(firstLaunch);
    });
    // Écoutez l'événement "ended" pour réinitialiser le bouton de lecture lorsque la musique est terminée
    this.audioElement.addEventListener('ended', () => {
      this.nextMusic();
    });

    if (this.audioElement) {
      // Ajoutez l'écouteur d'événement "timeupdate" ici
      this.audioElement.addEventListener("timeupdate", () => {
        this.updateProgress();
      });
    }
    if (!firstLaunch && !this.audioElement.error)
    {
      // TODO ca rentre jamais la dedans on change jamais firstLaunch a true 
      setTimeout(() => {
        // Code to be executed after 1 second
        this.togglePlayPause();
      }, 500);
    }
  
  }

  musicEnd(): void  {
    this.isplayButton = false;
    this.PlayOrPause = 'bi-play-fill';
    this.currentProgress = 0;
    this.colorArtist = "gray";
    this.colorTitle = "gray";
    this.Artist = "Artist : ?";
    this.Title = "Title : ?";

  }
  pauseMusic(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  stopMusic(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isplayButton = false;
      this.PlayOrPause = 'bi-play-fill';
      setTimeout(() => {
        if (this.audioElement) {
          this.audioElement.currentTime = 0; // Réinitialiser la position de lecture
          this.currentProgress = 0; // Réinitialiser la progression
          }
      }, 100);

    }
  }



}

