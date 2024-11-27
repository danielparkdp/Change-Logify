const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const revert = async (options) => {
    // Get commit history
    let rootDir;
    try {
        rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
    } catch (error) {
        console.error('Failed to get the root directory of the Git repository:', error);
        return;
    }
    let logifyPath;
    try {
        logifyPath = execSync(`cat ${rootDir}/.logify | grep 'LOGIFY_PATH=' | cut -d'=' -f2`).toString().trim();
    } catch (error) {
        console.error('Failed to read LOGIFY_PATH from .logify file:', error);
        return;
    }
    const fullLogifyPath = path.join(rootDir, logifyPath);
    const logifyJsonPath = path.join(fullLogifyPath, 'logify', 'logify.json');
    let logifyJsonContent;
    try {
        logifyJsonContent = require(logifyJsonPath);
    } catch (error) {
        console.error('\x1b[31mFailed to read logify.json file. Ensure logify is set up with \x1b[1m\x1b[3mlogify init\x1b[0m\x1b[0m');
        return;
    }
    const logifyMap = logifyJsonContent.changelogs;
    let latestVersion;
    if (logifyMap.length > 0) {
        latestVersion = logifyMap[logifyMap.length - 1].version;
    } else {
        console.error('\x1b[31mNo versions to revert!\x1b[0m');
        return;
    }

    let versionsToRemove = [];
    if (options.patch && options.patch.length > 0) {
        const releaseFormat = /^(v?\d+\.\d+\.\d+)$/;
        options.patch.forEach(release => {
            if (!releaseFormat.test(release)) {
                console.error('\x1b[31mInvalid release format. Please follow standard release formating (ex. v0.0.1)\x1b[0m');
                return;
            }
            if (release.startsWith('v')) {
                release = release.slice(1);
            }
            versionsToRemove.push(`v${release}`);
        });
    } else {
        versionsToRemove.push(latestVersion);
    }

    logifyJsonContent.changelogs = logifyJsonContent.changelogs.filter(changelog => !versionsToRemove.includes(changelog.version));
    fs.writeFileSync(logifyJsonPath, JSON.stringify(logifyJsonContent, null, 2));
    console.log('\x1b[32mSuccessfully reverted!\x1b[0m');
}

module.exports = revert;

