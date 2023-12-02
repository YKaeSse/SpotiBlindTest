import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { CallbackComponent } from './callback/callback.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { BlindTestComponent } from './blind-test/blind-test.component';
import { SearchMusicComponent } from './search-music/search-music.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CallbackComponent,
    NavbarComponent,
    FooterComponent,
    BlindTestComponent,
    SearchMusicComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule, // add this lib to use ngModel
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
