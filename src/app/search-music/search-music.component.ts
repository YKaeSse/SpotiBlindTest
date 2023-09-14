import { Component } from '@angular/core';
import { redirectToAuthCodeFlow} from 'src/assets/code/token'
import { fetchProfile, getMusic} from 'src/assets/code/HttpRequest'
import { UserProfile, Search} from 'src/assets/code/ObjectsFormat'
import { ConfigService } from 'src/app/shared/config.service';

@Component({
  selector: 'app-search-music',
  templateUrl: './search-music.component.html',
  styleUrls: ['./search-music.component.scss']
})

export class SearchMusicComponent {
  musicSearch: string = "";
  errorMsg: string ="";
  IsSearch: boolean = false;

  /* Pour la réponse des sons */
  imagePath: string = "";
  ArtistName: string = "";
  MusicName: string = "";
  LienClick: string = "";
  constructor(private configService: ConfigService) {}

  async ngOnInit() {
    if (!this.configService.access_token) {
        redirectToAuthCodeFlow(this.configService.clientId);
    } else {
        const profile = await fetchProfile(this.configService.access_token);
        this.populateUI(profile);
    }
  }

  async getSearch() {
      if (this.musicSearch === "")
      {
        this.errorMsg = "Vous devez entrer une valeur";
      }
      else
      {
        this.errorMsg = "";
        let SearchReturn : Search = await getMusic(this.configService.access_token, this.musicSearch);
        this.imagePath = SearchReturn.tracks.items[0].album.images[0].url;
        this.ArtistName = SearchReturn.tracks.items[0].artists[0].name;
        this.MusicName = SearchReturn.tracks.items[0].name;
        this.LienClick = SearchReturn.tracks.items[0].external_urls.spotify;
        this.IsSearch = true;
      }
  }
  populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
  }
}
