import ExpoModulesCore

public class SpotifyIosModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SpotifyIos")

    Function("getApiKey") { () -> String in
      "api-key"
    }
  }
}
