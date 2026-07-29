import fs from 'node:fs';

// Prints the CHANGELOG section for the current version so the release workflow can
// use it as the GitHub release body. That body is what tauri-action writes into
// latest.json as `notes`, which is the text the in-app updater shows the user.

const { version } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');

const section = changelog
  .split(/^## /m)
  .slice(1)
  .find((entry) => entry.split('\n', 1)[0].trim().startsWith(version));

if (!section) {
  console.error(`No CHANGELOG.md section found for version ${version}.`);
  console.error(`Add a "## ${version} - YYYY-MM-DD" heading before tagging the release.`);
  process.exit(1);
}

process.stdout.write(section.split('\n').slice(1).join('\n').trim() + '\n');
