export const appVersion = {
  name: 'ClipWheel',
  version: '0.1.0',
  channel: 'stable',
  updateMode: 'github',
  releaseDate: '2026-07-06',
} as const;

export type AppVersion = typeof appVersion;
