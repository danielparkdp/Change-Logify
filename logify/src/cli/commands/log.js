const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const log = async (options) => {
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
        console.error('\x1b[31mNo logify history!\x1b[0m');
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let index = 0;

    const displayLogs = () => {
        const logsToShow = logifyMap.slice(index, index + 5);
        logsToShow.forEach(changelog => {
            console.log(`\x1b[1mVersion: ${changelog.version}\x1b[0m`);
            console.log(`\x1b[1mTimestamp: ${changelog.timestamp}\x1b[0m`);
            console.log(changelog.log);
            console.log('__________\n');
        });
        index += 5;
        if (index < logifyMap.length) {
            rl.question('Press Enter to load more logs or Esc to exit...', (answer) => {
                if (answer === '') {
                    displayLogs();
                } else {
                    rl.close();
                }
            });
        } else {
            console.log('No more logs to display.');
            rl.close();
        }
    };

    displayLogs();
}

module.exports = log;

