cask "clipwheel" do
  arch arm: "aarch64", intel: "x64"

  version "0.3.0"
  sha256 arm: "<sha256-aarch64-dmg>",
         intel: "<sha256-x64-dmg>"

  url "https://github.com/mustafasavul/ClipWheel/releases/download/v#{version}/ClipWheel_#{version}_#{arch}.dmg"
  name "ClipWheel"
  desc "Privacy-first radial clipboard manager"
  homepage "https://github.com/mustafasavul/ClipWheel"

  app "ClipWheel.app"
end
