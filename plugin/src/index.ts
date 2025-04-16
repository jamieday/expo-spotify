import { withInfoPlist, withDangerousMod } from "@expo/config-plugins";
import * as fs from "fs";
import * as path from "path";
import { ExpoConfig } from "expo/config";

type PluginProps = {
  clientId: string;
  redirectUrl: string;
  tokenSwapUrl: string;
  tokenRefreshUrl: string;
  bundleIdentifier: string;
  scopes: string[];
};

function withSpotifyIos(config: ExpoConfig, props: PluginProps) {
  // === Dangerous Mod for File System Operations (Bridging Header, Config File) ===
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const projectName = config.modRequest.projectName;
      if (!projectName) {
        throw new Error("Could not determine project name.");
      }

      // --- Create or append to bridging header ---
      const bridgingHeaderPath = path.join(
        platformProjectRoot,
        `${projectName}-Bridging-Header.h`
      );
      const bridgingHeaderContent = `#import <SpotifyiOS/SpotifyiOS.h>\n`;

      if (fs.existsSync(bridgingHeaderPath)) {
        const existingContent = fs.readFileSync(bridgingHeaderPath, "utf-8");
        if (!existingContent.includes("#import <SpotifyiOS/SpotifyiOS.h>")) {
          fs.appendFileSync(bridgingHeaderPath, bridgingHeaderContent);
        }
      } else {
        fs.writeFileSync(bridgingHeaderPath, bridgingHeaderContent);
      }

      // --- Create configuration file inside the main project source ---
      const moduleConfigPath = path.join(
        platformProjectRoot, // Use platformProjectRoot
        projectName, // Place it inside the project directory
        "SpotifyConfig.swift" // Name the file
      );
      const moduleConfigDir = path.dirname(moduleConfigPath);
      if (!fs.existsSync(moduleConfigDir)) {
        fs.mkdirSync(moduleConfigDir, { recursive: true });
      }
      const configContent = `import Foundation

struct SpotifyConfig {
    static let shared = SpotifyConfig()
    
    let clientId: String = "${props.clientId}"
    let redirectUrl: String = "${props.redirectUrl}"
    let tokenSwapUrl: String = "${props.tokenSwapUrl}"
    let tokenRefreshUrl: String = "${props.tokenRefreshUrl}"
    let scopes: [String] = ${JSON.stringify(props.scopes)}
    
    private init() {}
}
`;
      fs.writeFileSync(moduleConfigPath, configContent);

      return config;
    },
  ]);

  // === 3. Info.plist Modifications (URL Schemes, Query Schemes) ===
  config = withInfoPlist(config, (config) => {
    // Add LSApplicationQueriesSchemes
    if (!config.modResults.LSApplicationQueriesSchemes) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }
    if (!config.modResults.LSApplicationQueriesSchemes.includes("spotify")) {
      config.modResults.LSApplicationQueriesSchemes.push("spotify");
    }

    // Add CFBundleURLTypes
    if (!config.modResults.CFBundleURLTypes) {
      config.modResults.CFBundleURLTypes = [];
    }

    const redirectUrl = new URL(props.redirectUrl);
    const urlScheme = redirectUrl.protocol.replace(":", "");

    const bundleId = props.bundleIdentifier || config.ios?.bundleIdentifier;
    if (!bundleId) {
      throw new Error(
        "Could not determine bundle identifier from props or Expo config."
      );
    }

    let urlType = config.modResults.CFBundleURLTypes.find(
      (type) => type.CFBundleURLName === bundleId
    );

    if (urlType) {
      if (!urlType.CFBundleURLSchemes.includes(urlScheme)) {
        urlType.CFBundleURLSchemes.push(urlScheme);
      }
    } else {
      config.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [urlScheme],
        CFBundleURLName: bundleId,
      });
    }

    return config;
  });

  return config;
}

export default withSpotifyIos;
