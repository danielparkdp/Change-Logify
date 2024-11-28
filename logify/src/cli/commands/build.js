const { execSync } = require('child_process');
const path = require('path');
const createChangelogTemplate = require("./frontend/template");
const fs = require('fs');

const build = (options) => {
    let rootDir;
    try {
        rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
    } catch (error) {
        console.error('Failed to get the root directory of the Git repository:', error);
        return;
    }
    let destinationPath;
    if (options.destination) {
        destinationPath = path.normalize(options.destination);
        if (destinationPath.startsWith(rootDir)) {
            destinationPath = destinationPath.substring(rootDir.length);
        }

    } else {
        try {
            destinationPath = execSync(`cat ${rootDir}/.logify | grep 'BUILD_PATH=' | cut -d'=' -f2`).toString().trim();
        } catch (error) {
            console.error('Failed to read BUILD_PATH from .logify file:', error);
            return;
        }
    }
    let fullDestinationPath = path.join(rootDir, destinationPath)

    fullDestinationDirectories = fullDestinationPath.split(path.sep);
    fullDestinationDirectories.pop();
    fullDestinationDirectories = fullDestinationDirectories.join(path.sep);
    if (!fs.existsSync(fullDestinationDirectories) || !fs.statSync(fullDestinationDirectories).isDirectory()) {
        console.error('\x1b[31mDestination path ' + fullDestinationPath + ' is not a valid path.\x1b[0m');
        return;
    }
    const logifyFilePath = path.join(rootDir, '.logify');
    const logifyContent = fs.readFileSync(logifyFilePath, 'utf8');
    const updatedLogifyContent = logifyContent.replace(/BUILD_PATH=.*?(\n|$)/, `BUILD_PATH=${destinationPath}\n`);
    fs.writeFileSync(logifyFilePath, updatedLogifyContent);

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

    const repoName = path.basename(rootDir);
    const changelogHtml = createChangelogTemplate(repoName, logifyJsonContent);

    fs.writeFileSync(fullDestinationPath, changelogHtml);

    console.log(`\x1b[32mChangelog page successfully generated at ${destinationPath}.\x1b[0m`);

    return changelogHtml
}

module.exports = build;
