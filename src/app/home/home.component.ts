import { Component,ViewEncapsulation } from '@angular/core';
import { redirectToAuthCodeFlow, getAccessToken} from 'src/assets/code/token';
import { fetchProfile, getSearch, getUserPlaylists, getUserAlbums} from 'src/assets/code/HttpRequest';
import { UserProfile, Search, UserPlaylists, UserAlbums} from 'src/assets/code/ObjectsFormat';
import { ConfigService } from 'src/app/shared/config.service';

var Vibrant = require('node-vibrant');

interface playlistItem
{
  playlistUrl: string, 
  imagePath: string, 
  PlaylistName:string
}


interface albumItem
{
  albumUrl: string, 
  imagePath: string, 
  albumName:string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  musicSearch: string = "";
  errorMsg: string ="";
  
  IsGlobalSearch: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  sortby: string = "recentAdd";
  sortAsc: boolean = false;

  /* Pour la réponse de la playlist */
  imagePath: string = "";
  PlaylistName: string = "";
  LienClick: string = "";

  PersonnalizeGlow: any = "";

  AllItemsPlaylist: playlistItem[] = [];
  AllItemsAlbums:  albumItem[] = [];
  ItemsPlaylistSortByRecentAdd: playlistItem[] = [];
  ItemsAlbumSortByRecentAdd: albumItem[] = [];
  itemsPlaylists: playlistItem[] = []; // Déclaration du tableau de données
  itemsAlbums: albumItem[] = [];
  constructor(private configService: ConfigService) {

    //this.getPlaylist();
  }
  async getAlbums() {
    let offset : number = 0;
    let AlbumsUser : UserAlbums = await getUserAlbums(this.configService.access_token,offset);
    let Albums = AlbumsUser.items;
    console.log("Nombre d'albums totales " + Albums.length)
    for (let album of Albums) {
      let myAlbum = album.album;
      const params = new URLSearchParams();
      params.append("id", myAlbum.id);
      const link = `/blindtest?${params.toString()}`;
      this.itemsAlbums.push({
        albumUrl: link,
        imagePath: myAlbum.images[0].url,
        albumName: myAlbum.name.toString()
      });
    }
    this.AllItemsAlbums = this.itemsAlbums;
    this.ItemsAlbumSortByRecentAdd = this.itemsAlbums;
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
      this.itemsPlaylists.push({
        playlistUrl: link,
        imagePath: playlist.images[0].url,
        PlaylistName: playlist.name.toString()
      });
    }
    this.AllItemsPlaylist = this.itemsPlaylists;
    this.ItemsPlaylistSortByRecentAdd = this.itemsPlaylists;
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

  onSearchChange(searchValue: any): void {
    const value: string = (searchValue.target.value).toLowerCase().replaceAll(" ", "");
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if(this.IsSearch){
      this.items = [];
      // TODO : lancer la fonction de recherche globale
      this.timer = setTimeout(async () => {
        let resultSearch : Search = await getSearch(this.configService.access_token, value);
        // Recup les playlists
        let arrPlaylists: playlistItem[] = [];
        resultSearch.playlists.items.forEach(elt => {
          const params = new URLSearchParams();
          params.append("id", elt.id);
          const link = `/blindtest?${params.toString()}`;
          arrPlaylists.push({
            playlistUrl: link,
            imagePath: elt.images[0].url,
            PlaylistName: elt.name.toString()
          });
        })
        // TODO probleme quand y'aura aussi les albums donc soit push direct dans items soit faire un items.push(...arrPlaylists) etc
        this.itemsPlaylists = arrPlaylists;

        //Recup des albums
        // TODO gerer la reception et la traitement des albums 
        // quand ca sera fait gerer le fait de pas afficher les albums a 1 ou 2 titres -> pas interessant
      }, 1000);
    }
    else
    {
      if (value === "")
      this.items = this.AllItems;
      else
      {
        // TODO faudrait gerer le fait que si dans la recherche deux noms en lowercase sont egaux, les comparer sans lowercase
        this.itemsPlaylists = [];
        this.AllItemsPlaylist.forEach(elt => {
          const PlaylistName: string = (elt.PlaylistName).toLowerCase().replaceAll(" ", "");
          if (PlaylistName.includes(value))
          {
            console.log(value, PlaylistName)
            this.items.push(elt);
          }
        });
      }
    }
  }

  SortBy(by: string)
  {
    if (by === "name")
    {
      let lessThan: number = -1
      let greaterThan: number = 1
      if (this.sortby === "name" && !this.sortAsc)
      {
          this.sortAsc = true;
          lessThan = 1;
          greaterThan = -1;
      }
      else
      {
        this.sortAsc = false;
        this.sortby = by;
      }
      this.itemsPlaylists = this.itemsPlaylists.sort((a, b) => {
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
      if (this.sortby === "recentAdd")
      {
        if (!this.sortAsc)
        {
          this.sortAsc = true;
          this.items = this.ItemsSortByRecentAdd.reverse();
        }
        else
          this.items = this.ItemsSortByRecentAdd;
      }
      else
      {
        this.sortAsc = false;
        this.sortby = by;
        this.items = this.ItemsSortByRecentAdd;
      }
    }
  }

  changeGlobalSearch(isGlobal: boolean)
  {
    this.IsGlobalSearch = isGlobal;
    const simulatedEvent = { target: { value: (document.getElementById('InputSearchPlaylist') as HTMLInputElement).value } };
    this.onSearchChange(simulatedEvent);
  }
}
