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
    let difference = 3

    logifyMap.reverse();

    const displayLogs = () => {
        const logsToShow = logifyMap.slice(index, index + difference);
        logsToShow.forEach(changelog => {
            const printWithDelay = (text) => {
                for (let i = 0; i < text.length; i++) {
                    process.stdout.write(text[i]);
                    const waitTimeMs = 3;
                    const start = new Date().getTime();
                    while (new Date().getTime() < start + waitTimeMs);
                }
                console.log();
            };

            printWithDelay(`\x1b[1mVersion: ${changelog.version}\x1b[0m`);
            printWithDelay(`\x1b[1mTimestamp: ${changelog.timestamp}\x1b[0m`);
            printWithDelay(changelog.log);
            printWithDelay('__________\n');
        });
        index += difference;
        if (index < logifyMap.length) {
            rl.question('\x1b[3mPress Enter to load more or Ctrl+C to exit...\x1b[0m\n', (answer) => {
                if (answer === '') {
                    displayLogs();
                } else {
                    rl.close();
                }
            });
        } else {
            console.log('\x1b[3m\x1b[1m--END OF LOGS--\x1b[0m\n');
            rl.close();
        }
    };

    rl.on('SIGINT', () => {
        console.log('\x1b[3mExiting...\x1b[0m');
        rl.close();
    });

    displayLogs();
}

module.exports = log;

