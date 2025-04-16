import ExpoModulesCore
import SpotifyiOS

public class SpotifyIosModule: Module {
    private var sessionManager: SPTSessionManager?
    private var player: SPTAppRemote?
    
    public required init(appContext: AppContext) {
        super.init(appContext: appContext)
    }
    
    public func definition() -> ModuleDefinition {
        Name("SpotifyIos")
        
        Function("initialize") { () in
            self.setupSessionManager()
        }
        
        AsyncFunction("login") { () -> Void in
            guard let sessionManager = self.sessionManager else {
                throw SpotifyError.notInitialized
            }
            
            let config = SpotifyConfig.shared
            let scopes = config.scopes.compactMap { SPTScope(rawValue: $0) }
            
            sessionManager.initiateSession(with: scopes, options: .default)
        }
        
        AsyncFunction("logout") { () -> Void in
            self.player?.disconnect()
            self.sessionManager?.session = nil
        }
        
        AsyncFunction("isLoggedIn") { () -> Bool in
            return self.sessionManager?.session != nil
        }
        
        AsyncFunction("getAccessToken") { () -> String? in
            return self.sessionManager?.session?.accessToken
        }
        
        AsyncFunction("play") { (uri: String) -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.play(uri)
        }
        
        AsyncFunction("pause") { () -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.pause()
        }
        
        AsyncFunction("resume") { () -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.resume()
        }
        
        AsyncFunction("skipToNext") { () -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.skip(toNext: nil)
        }
        
        AsyncFunction("skipToPrevious") { () -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.skip(toPrevious: nil)
        }
        
        AsyncFunction("seekTo") { (position: Double) -> Void in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            player.playerAPI?.seek(to: position)
        }
        
        AsyncFunction("getPlayerState") { () -> [String: Any] in
            guard let player = self.player else {
                throw SpotifyError.notInitialized
            }
            
            return [
                "isPlaying": player.playerAPI?.isPlaying ?? false,
                "position": player.playerAPI?.playbackPosition ?? 0,
                "duration": player.playerAPI?.playbackDuration ?? 0,
                "trackUri": player.playerAPI?.currentTrack?.uri
            ]
        }
    }
    
    private func setupSessionManager() {
        let config = SpotifyConfig.shared
        
        let configuration = SPTConfiguration(
            clientID: config.clientId,
            redirectURL: URL(string: config.redirectUrl)!
        )
        
        sessionManager = SPTSessionManager(configuration: configuration, delegate: self)
        player = SPTAppRemote(configuration: configuration, logLevel: .debug)
        player?.delegate = self
    }
}

extension SpotifyIosModule: SPTSessionManagerDelegate {
    public func sessionManager(manager: SPTSessionManager, didInitiate session: SPTSession) {
        player?.connectionParameters.accessToken = session.accessToken
        player?.connect()
    }
    
    public func sessionManager(manager: SPTSessionManager, didFailWith error: Error) {
        // Handle error
    }
    
    public func sessionManager(manager: SPTSessionManager, didRenew session: SPTSession) {
        player?.connectionParameters.accessToken = session.accessToken
    }
}

extension SpotifyIosModule: SPTAppRemoteDelegate {
    public func appRemoteDidEstablishConnection(_ appRemote: SPTAppRemote) {
        // Connection established
    }
    
    public func appRemote(_ appRemote: SPTAppRemote, didDisconnectWithError error: Error?) {
        // Handle disconnection
    }
    
    public func appRemote(_ appRemote: SPTAppRemote, didFailConnectionAttemptWithError error: Error?) {
        // Handle connection failure
    }
}

enum SpotifyError: Error {
    case notInitialized
} 