
import { UserProfile, Search, Track, UserPlaylists, PlaylistTracks,PlaylistTracksItem} from 'src/assets/code/ObjectsFormat'
import { redirectToAuthCodeFlow} from 'src/assets/code/token'
import { ConfigService } from 'src/app/shared/config.service';
import { resolve } from 'path';

const config = new ConfigService();

// TODO une fonction CheckStatus qu'on met a la fin de chaque requete et qui redire sur le refresh token si 401 ou 429 ratelimit etc 
function CheckStatus(response: Response)
{
  if (response.ok)
    return;
  else if (response.status == 401)
  {
    console.error(response)
    redirectToAuthCodeFlow(config.clientId);
  }
  else if (response.status == 429)
  {
    console.error(response)
    WaitRateLimit(response);
  }
  else
  {
    throw new Error(`Failed to request `+ response);
  }
}

async function WaitRateLimit(response: Response)
{
  // Aucune idee si ca va marcher 
  console.log("RATE LIMITTTTTTTTTTTTTTTTTT");
  const result = await response.json();
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, result["Rety-After"] * 1000 + 100);
  })
}


export async function fetchProfile(code: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    CheckStatus(result);
    return await result.json();
  }


export async function getMusic(code: string, searchText: string): Promise<Search> {
  const params = new URLSearchParams();
  params.append("q", searchText);
  params.append("type", "track");

  const result = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  CheckStatus(result);
  return await result.json();
}

export async function getPlaylistTracks(code: string, playlistID: string): Promise<{ tracks: PlaylistTracks; totalTrack: number; }>  {
  let tracks: PlaylistTracksItem[] = [];
  let requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`;

  //first 50 songs
  const promises: Promise<void>[] = [];
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${code}` }
  })
  CheckStatus(response);
  const result = await response.json();
  const currentTracks = result.items;
  requestUrl = result.next;
  tracks.push(...currentTracks);
  const total = result.total;

  //async with others
  const limitMax = (Math.floor(total / 50) + 1) * 50;
  for (let offset = 50; offset < limitMax; offset += 50)
  {
    requestUrl = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=50`
    promises.push(fetch(requestUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    }).then(async (res) => {
      CheckStatus(res)
      const data = await res.json();
      tracks.push(...data.items);
      }));
  }

  await Promise.all(promises);

  const PlaylistTracks: PlaylistTracks = { "items": tracks } as PlaylistTracks;
  console.log(PlaylistTracks);
  return { tracks: PlaylistTracks, totalTrack: total}; 
}

/* 5HCGrYR7g9u2X9Ju83yQLm */
export async function getPlayable(code: string, idMusic: string): Promise<Track> {
  const result = await fetch(`https://api.spotify.com/v1/tracks/${idMusic}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  CheckStatus(result);
  return await result.json() ;
}

export async function getUserPlaylists(code: string, offset: number): Promise<UserPlaylists> {
  let tracks: PlaylistTracksItem[] = [];
  let requestUrl = `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`;

  //first 50 Playlists
  
  const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  CheckStatus(response);
  const result = await response.json();
  const currentPlaylist = result.items;
  const total = result.total;

  //async all rest Playlist
  const promises: Promise<void>[] = [];
  const limitMax = (Math.floor(total / 50) + 1) * 50;
  for (let offset = 50; offset < limitMax; offset += 50)
  {
    requestUrl = `https://api.spotify.com/v1/me/playlists/?offset=${offset}&limit=50`
    promises.push(fetch(requestUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${code}` }
    }).then(async (res) => {
        CheckStatus(res);
        const data = await res.json();
        currentPlaylist.push(...data.items);
      }));
  }

  await Promise.all(promises);
  const Playlists: UserPlaylists = { "items": currentPlaylist } as UserPlaylists;
  return Playlists;
}

