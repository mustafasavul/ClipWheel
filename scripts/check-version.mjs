import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const cargoToml = fs.readFileSync('src-tauri/Cargo.toml', 'utf8');
const tauriConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'));
const versionTs = fs.readFileSync('src/shared/version.ts', 'utf8');

const cargoVersion = matchVersion(cargoToml, /^version = "([^"]+)"/m, 'src-tauri/Cargo.toml');
const sharedVersion = matchVersion(versionTs, /version: '([^']+)'/, 'src/shared/version.ts');
const versions = new Map([
  ['package.json', packageJson.version],
  ['src-tauri/Cargo.toml', cargoVersion],
  ['src-tauri/tauri.conf.json', tauriConfig.version],
  ['src/shared/version.ts', sharedVersion],
]);

const unique = new Set(versions.values());
if (unique.size !== 1) {
  console.error('Version mismatch:');
  for (const [file, version] of versions) {
    console.error(`  ${file}: ${version}`);
  }
  process.exit(1);
}

const [version] = unique;

// tauri-action derives the release tag from tauri.conf.json (`v__VERSION__`), not
// from the tag that triggered the workflow. If the two disagree, pushing `v0.2.0`
// silently publishes to `v0.2.0` instead. Fail loudly rather than mis-release.
if (process.env.GITHUB_REF_TYPE === 'tag') {
  const tag = process.env.GITHUB_REF_NAME;
  if (tag !== `v${version}`) {
    console.error(`Tag mismatch: pushed tag is ${tag} but the app version is ${version}.`);
    console.error(`Push v${version}, or bump the version to match ${tag}.`);
    process.exit(1);
  }
  console.log(`Tag ${tag} matches the app version.`);
}

console.log(`ClipWheel version ${version}`);

function matchVersion(content, pattern, file) {
  const match = content.match(pattern);
  if (!match) {
    throw new Error(`Unable to read version from ${file}`);
  }
  return match[1];
}
