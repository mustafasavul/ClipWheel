import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config = {
  packagerConfig: {
    asar: true,
    executableName: 'ClipWheel',
    name: 'ClipWheel',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ name: 'ClipWheel' }),
    new MakerZIP({}, ['darwin']),
    new MakerDMG({ format: 'ULFO' }, ['darwin']),
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main/main.ts', config: 'vite.main.config.ts' },
        { entry: 'src/preload/index.ts', config: 'vite.preload.config.ts' },
      ],
      renderer: [{ name: 'main_window', config: 'vite.renderer.config.ts' }],
    }),
  ],
};

export default config;
