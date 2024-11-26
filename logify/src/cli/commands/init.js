const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const rl = require('readline');

const initiateConfig = () => {
    return new Promise(resolve => {
        // Generate .logify config file
        let rootDir;
        try {
            rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
        } catch (error) {
            console.error('\x1b[31mThis is not a Git repository!');
            resolve(null);
        }
        const logifyFile = path.join(rootDir, '.logify');
        if (!fs.existsSync(logifyFile)){
            fs.writeFileSync(logifyFile, '');
            const readlinePath = rl.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            let logifyPath;
            readlinePath.question('Enter path in repo to save logify files (default is root dir): ', (logify_path) => {
                logifyPath = logify_path.trim() || '';
                readlinePath.close();
                resolve(logifyPath)
            });
        } else {
            
            const readline = rl.createInterface({
                input: process.stdin,
                output: process.stdout
            }).on('close', () => {});
            readline.question('.logify config file already exists. Do you want to overwrite it? (Y/N) ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    fs.writeFileSync(logifyFile, '');
                    console.log('\x1b[32m.logify file has been re-created.\x1b[0m');
                    readline.close();
                    const readlinePath = rl.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    let logifyPath;
                    readlinePath.question('Enter path in repo to save logify files (default is root dir): ', (logify_path) => {
                        logifyPath = logify_path.trim() || '';
                        readlinePath.close();
                        resolve(logifyPath)
                    });
                } else if (answer.toLowerCase() === 'n') {
                    console.error('\x1b[33m.logify file has not been overwritten... Exiting\x1b[0m');
                    readline.close();
                    resolve(null);
                } else {
                    console.log('\x1b[31mInvalid input. Please enter Y or N.\x1b[0m');
                    readline.close();
                    resolve(null);
                }
                
            });
        }
    });
}

const init = async () => {
    logify_path = await initiateConfig()
    if (logify_path === null || logify_path === undefined) {
        return;
    }
    console.log(`Path provided: ${logify_path}`)
    let rootDir;
    try {
        rootDir = execSync('git rev-parse --show-toplevel').toString().trim();
    } catch (error) {
        console.error('Failed to get the root directory of the Git repository:', error);
        return;
    }
    logify_path = path.normalize(logify_path);
    while (logify_path.endsWith('/')) {
        logify_path = logify_path.slice(0, -1);
    }
    const logifyDir = path.join(rootDir, logify_path);

    try {
        console.log(logifyDir)
        if (!fs.existsSync(logifyDir)) {
            console.error('\x1b[31m', 'Error: directory does not exist; please enter a valid directory');
            return;
        }
    } catch (error) {
        console.error('\x1b[31m', 'Error: directory does not exist; please enter a valid directory');
        return;
    }

    try {
        execSync(`mkdir -p ${logifyDir}/logify`);
    } catch (error) {
        console.error('\x1b[31m', 'Failed to create the logify directory:', error);
        return;
    }
    const logifyConfigPath = path.join(rootDir, '.logify');
    const logifyConfigContent = `LOGIFY_PATH=${logify_path}`;
    try {
        fs.writeFileSync(logifyConfigPath, logifyConfigContent);

        const logifyJsonPath = path.join(logifyDir, 'logify', 'logify.json');
        const logifyJsonContent = `{"changelogs":[]}`;
        try {
            fs.writeFileSync(logifyJsonPath, logifyJsonContent);
        } catch (error) {
            console.error('\x1b[31mFailed to write to logify.json file:');
            return;
        }

        console.log('\x1b[32mSuccess! Changelogs to be stored in: ' + logifyDir + '/logify\x1b[0m');
    } catch (error) {
        console.error('\x1b[31mFailed to write to .logify file:\x1b[0m');
        return;
    }

}

module.exports = init;

