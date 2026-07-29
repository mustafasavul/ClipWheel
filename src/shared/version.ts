export const appVersion = {
  name: 'ClipWheel',
  version: '0.2.0',
  channel: 'stable',
  updateMode: 'github',
  releaseDate: '2026-07-29',
} as const;

export type AppVersion = typeof appVersion;
