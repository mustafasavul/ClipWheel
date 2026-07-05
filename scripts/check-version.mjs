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
console.log(`ClipWheel version ${version}`);

function matchVersion(content, pattern, file) {
  const match = content.match(pattern);
  if (!match) {
    throw new Error(`Unable to read version from ${file}`);
  }
  return match[1];
}
