import { Component } from '@angular/core';
import { redirectToAuthCodeFlow, getAccessToken} from 'src/assets/code/token';
import { fetchProfile, getUserPlaylists} from 'src/assets/code/HttpRequest';
import { UserProfile, Search, UserPlaylists} from 'src/assets/code/ObjectsFormat';
import { ConfigService } from 'src/app/shared/config.service';
var Vibrant = require('node-vibrant');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  musicSearch: string = "";
  errorMsg: string ="";
  IsSearch: boolean = false;

  /* Pour la réponse de la playlist */
  imagePath: string = "";
  PlaylistName: string = "";
  LienClick: string = "";

  PersonnalizeGlow: any = "";

  AllItems: any[] = [];
  ItemsSortByRecentAdd: any[] = [];
  items: any[] = []; // Déclaration du tableau de données

  constructor(private configService: ConfigService) {

    //this.getPlaylist();
  }

  async getPlaylist() {
    this.errorMsg = "";
    let offset : number = 0;
    let PlaylistUser : UserPlaylists = await getUserPlaylists(this.configService.access_token,offset);
    let playlists = PlaylistUser.items;
    console.log("Nombre de playlists totales " + playlists.length)
    for (const playlist of playlists) {
      const params = new URLSearchParams();
      params.append("id", playlist.id);
      const link = `/blindtest?${params.toString()}`;
      this.items.push({
        playlistUrl: link,
        imagePath: playlist.images[0].url,
        PlaylistName: playlist.name.toString()
      });
    }
    this.AllItems = this.items;
    this.ItemsSortByRecentAdd = this.items;
 }
  resetCount() {
    this.configService.actualNumber = 0;
  }
  async ngOnInit() {
    console.log("home");
    if (!this.configService.access_token) {
        redirectToAuthCodeFlow(this.configService.clientId);
    } else {
        const profile = await fetchProfile(this.configService.access_token);
        this.getPlaylist();
    }
  }

  async getGlow(event: MouseEvent, imagePath: string) {
    const element = event.target as HTMLElement;

    if (element) {
      Vibrant.from(imagePath)
        .getPalette()
        .then((palette: any) => {
          const dominantColor = palette.Vibrant.getHex();
          console.log('Couleur dominante:', dominantColor);
          document.documentElement.style.setProperty('--theme-color-1', dominantColor);
        })
        .catch((error: Error) => {
          console.error("Erreur lors de l'extraction des couleurs:", error.message);
        });
      }
  }

  oldInput: string = "";
  onSearchChange(searchValue: any): void {  
    const value: string = (searchValue.target.value).toLowerCase().replaceAll(" ", "");
    if (this.oldInput.toLowerCase().replaceAll(" ", "") === value)
      return;
    else
      this.oldInput = value;
    if (value === "")
      this.items = this.AllItems;
    else
    {
      this.items = [];
      this.AllItems.forEach(elt => {
        const PlaylistName: string = (elt.PlaylistName).toLowerCase().replaceAll(" ", "");
        if (PlaylistName.includes(value))
        {
          console.log(value, PlaylistName)
          this.items.push(elt);
        }
      });
    }
  }

  SortBy(by: string, ascendent: boolean)
  {
    let lessThan: number = ascendent ? -1 : 1
    let greaterThan: number = ascendent ? 1 : -1
    if (by === "name")
    {
      this.items = this.items.sort((a, b) => {
        const nameA = a.PlaylistName.toUpperCase();
        const nameB = b.PlaylistName.toUpperCase();
        if (nameA < nameB) {
          return lessThan;
        }
        if (nameA > nameB) {
          return greaterThan;
        }
        return 0;
      });
    }
    else if (by === "recentAdd")
    {
      if (ascendent)
        this.items = this.ItemsSortByRecentAdd;
      else
        this.items = this.ItemsSortByRecentAdd.reverse();
    }
  }

  private timer: NodeJS.Timeout | null = null;
  // Fonction qui sera appelée lorsqu'il y a un changement dans la barre de recherche
  onInputChange(text: string): void {
    // Si un délai est déjà en cours, le réinitialiser
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Définir un nouveau délai
    this.timer = setTimeout(() => {
      // Fonction à exécuter après le délai
      //this.envoyerRequeteApi(text);
    }, 1000); // 1000 millisecondes (1 seconde) de délai, ajustez selon vos besoins
  }
}
