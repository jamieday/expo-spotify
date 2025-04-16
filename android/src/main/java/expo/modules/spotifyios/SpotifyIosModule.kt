package expo.modules.nativeconfiguration

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SpotifyIosModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SpotifyIos")

    Function("getApiKey") {
      return@Function "api-key"
    }
  }
}
