import { requireNativeModule } from "expo-modules-core";

export interface SpotifyConfig {
  clientId: string;
  redirectUrl: string;
  tokenSwapUrl: string;
  tokenRefreshUrl: string;
  scopes: string[];
}

export interface SpotifyIosModule {
  initialize(config: SpotifyConfig): Promise<void>;
  login(): Promise<void>;
  logout(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getAccessToken(): Promise<string | null>;
  play(uri: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  skipToNext(): Promise<void>;
  skipToPrevious(): Promise<void>;
  seekTo(position: number): Promise<void>;
  getPlayerState(): Promise<{
    isPlaying: boolean;
    position: number;
    duration: number;
    trackUri: string | null;
  }>;
}

export default requireNativeModule<SpotifyIosModule>("SpotifyIos");
