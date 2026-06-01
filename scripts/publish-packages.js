#!/usr/bin/env node
/*
 * Publishes the four public esp-js packages from the npm workspace.
 *
 * All packages share a single version. This script always bumps that version,
 * keeps the intra-repo dependency/peerDependency ranges in lockstep, then runs
 * `npm publish --workspaces` (private workspaces such as the example-app are
 * skipped automatically by npm). Every publish advances the version — there is
 * no publish-without-bump path.
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

// 3. Publish. npm skips private workspaces (e.g. the example-app) automatically.
const publishArgs = ['publish', '--workspaces', '--tag', tag];
if (dryRun) publishArgs.push('--dry-run');
console.log(`Running: npm ${publishArgs.join(' ')}\n`);
run('npm', publishArgs);
