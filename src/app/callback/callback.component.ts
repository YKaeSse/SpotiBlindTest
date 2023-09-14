import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigService } from '../shared/config.service';
import { getAccessToken} from 'src/assets/code/token'
@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent {
  constructor(private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService) {}
  async ngOnInit() { // Ajoutez les parenthèses après ngOnInit
    
    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      if (code) {
        let accessToken : string = await getAccessToken(this.configService.clientId, code);
        localStorage.setItem("access_token", accessToken);
        this.configService.access_token = accessToken;
        this.router.navigate(['/home']);
      } else {
        // Code non présent dans l'URL
        console.log('Code non présent');
      }
    });
  }
}
