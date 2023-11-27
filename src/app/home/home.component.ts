import { Component } from '@angular/core';
import { redirectToAuthCodeFlow, getAccessToken} from 'src/assets/code/token'
import { fetchProfile, getUserPlaylists} from 'src/assets/code/HttpRequest'
import { UserProfile, Search, UserPlaylists} from 'src/assets/code/ObjectsFormat'
import { ConfigService } from 'src/app/shared/config.service';
var Vibrant = require('node-vibrant');

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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
}
