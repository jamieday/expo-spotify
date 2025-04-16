import { withInfoPlist, withDangerousMod } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
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
  // Add Spotify pod and linker flags
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      const contents = fs.readFileSync(filePath, "utf-8");

      // Add Spotify pod
      const newContents = mergeContents({
        tag: "expo-spotify-pod",
        src: contents,
        newSrc: `  pod 'SpotifyiOS', '~> 1.2.3'`,
        anchor: /use_expo_modules!/,
        offset: 1,
        comment: "#",
      }).contents;

      // Add -ObjC linker flag
      const finalContents = mergeContents({
        tag: "expo-spotify-linker-flag",
        src: newContents,
        newSrc: `
    # Add linker flags and bridging header for SpotifyiOS
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['OTHER_LDFLAGS'] = '$(inherited) -ObjC'
        config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'] = '${config.modRequest.projectName}-Bridging-Header.h'
      end
    end`,
        anchor: /react_native_post_install\(/,
        offset: 0,
        comment: "#",
      }).contents;

      fs.writeFileSync(filePath, finalContents);

      // Create or append to bridging header
      const bridgingHeaderPath = path.join(
        config.modRequest.platformProjectRoot,
        `${config.modRequest.projectName}-Bridging-Header.h`
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

      // Create configuration file for the module
      const moduleConfigPath = path.join(
        config.modRequest.platformProjectRoot,
        "Pods",
        "SpotifyIos",
        "SpotifyConfig.swift"
      );

      // Ensure the directory exists
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

  // Add Info.plist entries
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

    const existingUrlType = config.modResults.CFBundleURLTypes.find(
      (type) =>
        type.CFBundleURLName === props.bundleIdentifier ||
        config.ios?.bundleIdentifier
    );

    if (existingUrlType) {
      if (!existingUrlType.CFBundleURLSchemes.includes(urlScheme)) {
        existingUrlType.CFBundleURLSchemes.push(urlScheme);
      }
    } else {
      config.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [urlScheme],
        CFBundleURLName: props.bundleIdentifier || config.ios?.bundleIdentifier,
      });
    }

    return config;
  });

  return config;
}

export default withSpotifyIos;
