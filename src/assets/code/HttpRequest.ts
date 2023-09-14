
import { UserProfile, Search, Track, UserPlaylists, PlaylistTracks} from 'src/assets/code/ObjectsFormat'
import { redirectToAuthCodeFlow} from 'src/assets/code/token'
import { ConfigService } from 'src/app/shared/config.service';

const config = new ConfigService();

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

export async function getPlaylistTracks(code: string, playlistID: string): Promise<PlaylistTracks> {

  const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  if (result.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }
  
  return result.json();
}
/* 5HCGrYR7g9u2X9Ju83yQLm */
export async function getPlayable(code: string, searchText: string): Promise<Track> {

  const result = await fetch(`https://api.spotify.com/v1/tracks/${searchText}`, {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
  });
  if (result.status === 401) {
    redirectToAuthCodeFlow(config.clientId);
  }
  return await result.json();
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

