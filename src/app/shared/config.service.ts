import { Injectable } from '@angular/core';

  @Injectable({
    providedIn: 'root'
  })
export class ConfigService {
  clientId: string = "72bcd993e83a45869b0ff7983177e4c9";
  access_token: string = localStorage.getItem("access_token") || "";
  actualNumber: number = 0;
  totalTracks : number =  0;
  playedTracks = [];
}
