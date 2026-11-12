import { mergeConfig } from 'vite';
import { createBaseConfig, dtsPlugin } from '../../vite.config.base';

const packageDir = __dirname;

export default mergeConfig(
    createBaseConfig(packageDir, 'src/index.ts', 'espJsUi', 'esp-js-ui'),
    {
        plugins: [
            ...dtsPlugin({
                include: ['src/**/*', 'typings/**/*'],
                outDir: '.dist/typings',
                tsconfigPath: './tsconfig.json',
                rollupTypes: false,
            }),
        ],
    }
);
