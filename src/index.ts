import SpotifyIosModule, {
  SpotifyConfig,
  SpotifyIosModule as ISpotifyIosModule,
} from "./SpotifyIosModule";

export { SpotifyConfig, ISpotifyIosModule };

export async function initialize(config: SpotifyConfig): Promise<void> {
  return SpotifyIosModule.initialize(config);
}

export async function login(): Promise<void> {
  return SpotifyIosModule.login();
}

export async function logout(): Promise<void> {
  return SpotifyIosModule.logout();
}

export async function isLoggedIn(): Promise<boolean> {
  return SpotifyIosModule.isLoggedIn();
}

export async function getAccessToken(): Promise<string | null> {
  return SpotifyIosModule.getAccessToken();
}

export async function play(uri: string): Promise<void> {
  return SpotifyIosModule.play(uri);
}

export async function pause(): Promise<void> {
  return SpotifyIosModule.pause();
}

export async function resume(): Promise<void> {
  return SpotifyIosModule.resume();
}

export async function skipToNext(): Promise<void> {
  return SpotifyIosModule.skipToNext();
}

export async function skipToPrevious(): Promise<void> {
  return SpotifyIosModule.skipToPrevious();
}

export async function seekTo(position: number): Promise<void> {
  return SpotifyIosModule.seekTo(position);
}

export async function getPlayerState(): Promise<{
  isPlaying: boolean;
  position: number;
  duration: number;
  trackUri: string | null;
}> {
  return SpotifyIosModule.getPlayerState();
}
