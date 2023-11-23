
import { UserProfile, Search, Track, UserPlaylists, PlaylistTracks,PlaylistTracksItem} from 'src/assets/code/ObjectsFormat'
import { redirectToAuthCodeFlow} from 'src/assets/code/token'
import { ConfigService } from 'src/app/shared/config.service';
import { elementAt } from 'rxjs';
import { off } from 'process';

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

export async function getPlaylistTracks2(code: string, playlistID: string): Promise<{ tracks: PlaylistTracks; totalTrack: number; }>  {

  //let totalTracks[]: PlaylistTracks = [];
  //TODO qunad la requete fait plus de 100 sons au total on lance une deuxieme requete qui va renvoyer les 100 premiers son plus le reste
  let response:Response;
  let tracks:PlaylistTracksItem[] = [];
  // `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`
  let requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`;
  let result;
  do 
  {
    response = await fetch(requestUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    });

    if (!response.ok) {
      console.log(response)
      if (response.status === 401) {
        redirectToAuthCodeFlow(config.clientId);
      }
      throw new Error(`Failed to get Playlist Tracks`);
    }
    result = await response.json();

    const currentTracks = result.items;
    requestUrl = result.next;
    tracks.push(...currentTracks);
    
  } while (result.next !== null)

  
  const PlaylistTracks: PlaylistTracks = { "items": tracks } as PlaylistTracks;
  console.log(PlaylistTracks)
  return {tracks: PlaylistTracks, totalTrack: result.total};
}

// `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`

export async function getPlaylistTracks(code: string, playlistID: string): Promise<{ tracks: PlaylistTracks; totalTrack: number; }>  {
  let tracks: PlaylistTracksItem[] = [];
  let requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`;

  //first 50 songs
  const promises: Promise<void>[] = [];
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` }
  })
  if (!response.ok) {
    console.log(response)
    if (response.status === 401) {
      redirectToAuthCodeFlow(config.clientId);
    }
    throw new Error(`Failed to get Playlist Tracks`);
  }
  const result = await response.json();
  const currentTracks = result.items;
  requestUrl = result.next;
  tracks.push(...currentTracks);
  const total = result.total;

  //async with others
  const limitMax = (Math.floor(total / 50) + 1) * 50;
  for (let offset = 50; offset < limitMax; offset += 50)
  {
    let limit = offset + 50;
    requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`
    const promise = fetch(requestUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    }).then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          redirectToAuthCodeFlow(config.clientId);
        }
        console.log(res);
        throw new Error(`Failed to get Playlist Tracks`);
      } 
        const data = await res.json();
        tracks.push(...data.items);
      });
  }

  await Promise.all(promises);

  const PlaylistTracks: PlaylistTracks = { "items": tracks } as PlaylistTracks;
  console.log(PlaylistTracks);
  return { tracks: PlaylistTracks, totalTrack: tracks.length }; 
}

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

