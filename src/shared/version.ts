export const appVersion = {
  name: 'ClipWheel',
  version: '0.1.1',
  channel: 'stable',
  updateMode: 'github',
  releaseDate: '2026-07-21',
} as const;

export type AppVersion = typeof appVersion;
