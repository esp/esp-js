import { mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { createBaseConfig } from '../../vite.config.base';

const packageDir = __dirname;

export default mergeConfig(
    createBaseConfig(packageDir, 'src/index.ts', 'espJsUi', 'esp-js-ui'),
    {
        plugins: [
            dts({
                include: ['src/**/*', 'typings/**/*'],
                outDir: '.dist/typings',
                tsconfigPath: './tsconfig.json',
                rollupTypes: false,
            }),
        ],
    }
);
