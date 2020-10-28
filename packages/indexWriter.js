const os = require('os');
const path = require('path');
const fs = require('fs');
const fileExclusions = ['.js', '.less', '.md', '.png', '.jpg', '.json', '.xml', 'webpack.config.js', 'jest.config.js', 'index.ts'];
const directoryExclusions = ['tests', 'typings', 'dist', 'node_modules','esp-js', 'esp-js-di', 'esp-js-polimer', 'esp-js-react', 'esp-js-ui-rxcompat'];

const logger = (message) => {
    console.log(`IndexWriter: ${message}`);
};

const fileSorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

const tryRecursivelyWriteIndexFiles = function (directory) {
    if (directoryExclusions.includes(path.basename(directory))) {
        return;
    }
    let files = fs.readdirSync(directory).sort(fileSorter);
    let directoryExports = '';
    let sideEffectImport = '';
    let fileExports = '';
    let newLine = os.platform() === 'win32' ? '\r\n' : '\n';
    files.forEach(function (file) {
        let directory1 = directory + '/' + file;
        if (fs.statSync(directory1).isDirectory()) {
            if (tryRecursivelyWriteIndexFiles(directory1)) {
                if (file.includes('.global')) {
                    sideEffectImport += `import './${file}'; // directory${newLine}`;
                } else {
                    directoryExports += `export * from './${file}';${newLine}`;
                }
            }
        }
        else {
            let excludeFile =
                fileExclusions.includes(path.extname(file).toLowerCase()) ||
                fileExclusions.includes(path.basename(file).toLowerCase()) ||
                file.includes('DS_Store');
            if (!excludeFile) {
                if (file.includes('.global')) {
                    sideEffectImport += `import './${path.parse(file).name}';${newLine}`;
                } else {
                    fileExports += `export * from './${path.parse(file).name}';${newLine}`;
                }
            }
        }
    });
    let finalOutput = ``;
    if (directoryExports) {
        finalOutput += directoryExports;
    }
    if (sideEffectImport) {
        finalOutput += sideEffectImport;
    }
    if (fileExports) {
        finalOutput += fileExports;
    }

    if (finalOutput === '') {
        finalOutput = 'export { };';
    }

    let blurb = `// Auto-generated ${newLine}`;
    let indexFile = `${directory}/index.ts`;
    finalOutput = `${blurb}${finalOutput}`;
    fs.writeFileSync(indexFile, finalOutput);
    return true;
};

const writeAllIndexFiles = (packagesDirectory) => {
    let directories = fs.readdirSync(packagesDirectory).sort(fileSorter);
    directories.forEach(function (directory) {
        let fullDirectoryPath = `${packagesDirectory}/${directory}`;
        if (!fs.statSync(fullDirectoryPath).isDirectory()) {
            return;
        }
        logger(`Writing all index files under directory ${directory}`);
        tryRecursivelyWriteIndexFiles(fullDirectoryPath, true);
    });
};

writeAllIndexFiles(__dirname);