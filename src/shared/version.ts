export const appVersion = {
  name: 'ClipWheel',
  version: '0.3.0',
  channel: 'stable',
  updateMode: 'github',
  releaseDate: '2026-07-30',
} as const;

export type AppVersion = typeof appVersion;
