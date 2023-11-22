
import { UserProfile, Search, Track, UserPlaylists, PlaylistTracks,PlaylistTracksItem} from 'src/assets/code/ObjectsFormat'
import { redirectToAuthCodeFlow} from 'src/assets/code/token'
import { ConfigService } from 'src/app/shared/config.service';
import { elementAt } from 'rxjs';

const config = new ConfigService();

// TODO une fonction CheckStatus qu'on met a la fin de chaque requete et qui redire sur le refresh token si 401 ou 429 ratelimit etc 

export async function fetchProfile(code: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    if (result.status === 401) {
      redirectToAuthCodeFlow(config.clientId);
    }
    return await result.json();
  }


export async function getMusic(code: string, searchText: string): Promise<Search> {
  const params = new URLSearchParams();
  params.append("q", searchText);
  params.append("type", "track");

  const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  if (result.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }
  return await result.json();
}

export async function getPlaylistTracks(code: string, playlistID: string): Promise<{ tracks: PlaylistTracks; totalTrack: number; }>  {

  //let totalTracks[]: PlaylistTracks = [];
  //TODO qunad la requete fait plus de 100 sons au total on lance une deuxieme requete qui va renvoyer les 100 premiers son plus le reste
  const tracks: PlaylistTracksItem[] = [];

  async function fetchTracks(url: string) {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirectToAuthCodeFlow(config.clientId);
      }
      console.log(response);
      throw new Error(`Failed to get Playlist Tracks`);
    }

    const data = await response.json();
    const currentTracks = data.items;
    tracks.push(...currentTracks);

    if (data.next !== null) {
      await fetchTracks(data.next);
    }
  }

  // Lancement initial de la fonction
  await fetchTracks(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`);

  const PlaylistTracks: PlaylistTracks = { "items": tracks } as PlaylistTracks;
  console.log(PlaylistTracks);
  return { tracks: PlaylistTracks, totalTrack: tracks.length };
}

/*
  export async function getPlaylistTracks(code: string, playlistID: string): Promise<{ tracks: PlaylistTracks; totalTrack: number; }>  {
  let response: Response;
  let tracks: PlaylistTracksItem[] = [];
  let requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`;
  let result;

  // Stocke les promesses de chaque requête dans un tableau
  const promises: Promise<void>[] = [];

  do {
    const promise = fetch(requestUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          console.log(res);
          throw new Error(`Failed to get Playlist Tracks`);
        }
        const data = await res.json();
        const currentTracks = data.items;
        requestUrl = data.next;
        tracks.push(...currentTracks);
      });

    promises.push(promise);

  } while (result.next !== null);

  // Attend que toutes les promesses soient résolues avant de continuer
  await Promise.all(promises);

  if (response.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }

  const PlaylistTracks: PlaylistTracks = { "items": tracks } as PlaylistTracks;
  console.log(PlaylistTracks);
  return { tracks: PlaylistTracks, totalTrack: result.total };
}
*/

/* 5HCGrYR7g9u2X9Ju83yQLm */
export async function getPlayable(code: string, searchText: string): Promise<Track> {
  const result = await fetch(`https://api.spotify.com/v1/tracks/${searchText}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  if (result.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }
  return await result.json() ;
}

export async function getUserPlaylists(code: string, offset: number): Promise<UserPlaylists> {

  const result = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  if (result.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }
  return await result.json();
}

