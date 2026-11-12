#!/usr/bin/env node
/*
 * Publishes the four public esp-js packages from the npm workspace.
 *
 * All packages share a single version. This script bumps that version, keeps the
 * intra-repo dependency/peerDependency ranges in lockstep, then publishes each
 * package in turn. If nothing was published (e.g. auth failed, Ctrl-C) or it's a
 * --dry-run, the version files are restored so a re-run doesn't skip a version.
 * If some packages published before one failed, the bump is kept (that version is
 * now taken on npm) and the command to publish the rest is printed.
 *
 * Usage:
 *   node scripts/publish-packages.js <releaseType> [options]
 *
 *   <releaseType>   patch | minor | major | prepatch | preminor | premajor | prerelease
 *
 * Options:
 *   --preid <id>    prerelease identifier, e.g. `beta` (for the pre* / prerelease types)
 *   --tag <npmTag>  npm dist-tag to publish under (default: latest)
 *   --dry-run       run `npm publish` in dry-run mode (no actual publish)
 *
 * Examples:
 *   node scripts/publish-packages.js minor                                # 9.0.0 -> 9.1.0, tag latest
 *   node scripts/publish-packages.js prerelease --preid beta --tag beta   # 9.0.0-beta.0 -> 9.0.0-beta.1
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Order matters: dependencies before dependents (purely cosmetic for logging).
const PUBLIC_PACKAGES = ['esp-js', 'esp-js-di', 'esp-js-ui', 'esp-js-react'];
const INTRA_REPO = new Set(PUBLIC_PACKAGES);

const root = path.resolve(__dirname, '..');
const pkgFile = name => path.join(root, 'packages', name, 'package.json');
const lockFile = path.join(root, 'package-lock.json');
const readPkg = name => JSON.parse(fs.readFileSync(pkgFile(name), 'utf8'));
const writePkg = (name, pkg) => fs.writeFileSync(pkgFile(name), JSON.stringify(pkg, null, 4) + '\n');

const argv = process.argv.slice(2);
const hasFlag = name => argv.includes(name);
const optValue = name => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
};

const releaseType = argv[0] && !argv[0].startsWith('--') ? argv[0] : undefined;
const preid = optValue('--preid');
const tag = optValue('--tag') || 'latest';
const dryRun = hasFlag('--dry-run');

const run = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { stdio: 'inherit', cwd: root });

// 1. Bump the shared version across the public packages. Every publish bumps.
if (!releaseType) {
    console.error('Error: a release type is required.');
    console.error('       e.g. `node scripts/publish-packages.js minor` or `... prerelease --preid beta`');
    process.exit(1);
}

// Snapshot the files the bump touches so it can be undone.
const snapshot = new Map([...PUBLIC_PACKAGES.map(pkgFile), lockFile].map(f => [f, fs.readFileSync(f, 'utf8')]));
const restoreVersionFiles = () => {
    for (const [file, content] of snapshot) fs.writeFileSync(file, content);
    console.error('Version files restored.');
};
// Ctrl-C also reaches the npm child; ignoring it here lets the child exit and the
// failure handling below restore the files.
process.on('SIGINT', () => {});

{
    const versionArgs = ['version', releaseType, '--no-git-tag-version'];
    if (preid) versionArgs.push('--preid', preid);
    for (const name of PUBLIC_PACKAGES) versionArgs.push('-w', name);
    run('npm', versionArgs);
}

// 2. All packages share one version — use esp-js as the source of truth and pin
//    every intra-repo dependency/peerDependency range to it.
const version = readPkg('esp-js').version;
const range = `^${version}`;
for (const name of PUBLIC_PACKAGES) {
    const pkg = readPkg(name);
    let changed = false;
    for (const field of ['dependencies', 'peerDependencies']) {
        const deps = pkg[field];
        if (!deps) continue;
        for (const dep of Object.keys(deps)) {
            if (INTRA_REPO.has(dep) && deps[dep] !== range) {
                deps[dep] = range;
                changed = true;
            }
        }
    }
    if (changed) writePkg(name, pkg);
}
console.log(`\nesp-js packages prepared at version ${version} (intra-repo ranges -> ${range}).`);

// 3. Publish each package, tracking which succeeded.
const published = [];
let failed;
for (const name of PUBLIC_PACKAGES) {
    const publishArgs = ['publish', '-w', name, '--tag', tag];
    if (dryRun) publishArgs.push('--dry-run');
    console.log(`Running: npm ${publishArgs.join(' ')}\n`);
    try {
        run('npm', publishArgs);
        published.push(name);
    } catch (err) {
        failed = name;
        break;
    }
}

if (dryRun || (failed && published.length === 0)) {
    restoreVersionFiles();
} else if (failed) {
    const remaining = PUBLIC_PACKAGES.slice(PUBLIC_PACKAGES.indexOf(failed));
    console.error(`\nPublished ${published.join(', ')} @ ${version}, then ${failed} failed. Publish the rest with:`);
    console.error(`  npm publish ${remaining.map(n => `-w ${n}`).join(' ')} --tag ${tag}`);
}
if (failed) process.exit(1);
