const { execSync } = require('child_process');
const path = require('path');
const createChangelogTemplate = require("./template");

const generateHtml = () => {
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

    const changelogHtml = createChangelogTemplate(logifyJsonContent);

    return changelogHtml
}

module.exports = generateHtml;
