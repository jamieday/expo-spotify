require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'SpotifyIos'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.homepage     = package['homepage']
  s.authors      = package['author']
  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => package['repository']['url'], :tag => s.version }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
  s.dependency 'SpotifyiOS', '~> 1.2.3'
  s.swift_version = '5.4'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
end
