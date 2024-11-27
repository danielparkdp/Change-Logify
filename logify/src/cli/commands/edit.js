const { execSync , spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edit = async (options) => {
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
    let editVersion;
    if (options.patch){
        const releaseFormat = /^(v?\d+\.\d+\.\d+)$/;
        if (!releaseFormat.test(options.patch)) {
            console.error('\x1b[31mInvalid patch format. Please follow standard patch formating (ex. v0.0.1)\x1b[0m');
            return;
        }
        if (options.patch.startsWith('v')) {
            options.patch = options.patch.slice(1);
        }
        editVersion = `v${options.patch}`;
    } else {
        if (logifyMap.length > 0) {
            editVersion = logifyMap[logifyMap.length - 1].version;
        } else {
            console.error('\x1b[31mNo versions to revert!\x1b[0m');
            return;
        }
    }

    let editChangelog = logifyMap.find(changelog => changelog.version === editVersion);
    if (!editChangelog) {
        console.error(`\x1b[31mNo changelog found for version ${editVersion}!\x1b[0m`);
        return;
    }

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`\x1b[1mEditing: ${editVersion}. \nPress Enter to continue or Ctrl+C to exit...\x1b[0m\n\n`, () => {
        // Create a temporary file for editing
        const tempFilePath = `${fullLogifyPath}/logify/temp_changelog_${editVersion}.txt`;
        fs.writeFileSync(tempFilePath, editChangelog.log);
        
        let editorChoice = 'vim';
        if (options.nano){
            editorChoice = 'nano';
        }
        const editor = process.env.EDITOR || editorChoice;
        const editorProcess = spawnSync(editor, [tempFilePath], { stdio: 'inherit' });
    
        if (editorProcess.error) {
            console.error(`\x1b[31mFailed to open editor: ${editorProcess.error.message}\x1b[0m`);
            fs.unlinkSync(tempFilePath);
            rl.close();
            return;
        }
    
        // Read the edited content
        const editedContent = fs.readFileSync(tempFilePath, 'utf8').trim();
    
        // Update the changelog and save to the JSON file
        editChangelog.log = editedContent;
        logifyJsonContent.changelogs[editVersion] = editChangelog.log;
        fs.writeFileSync(logifyJsonPath, JSON.stringify(logifyJsonContent, null, 2));
    
        console.log(`\x1b[32mSuccessfully edited changelog for version ${editVersion}!\x1b[0m`);
    
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
        rl.close();
    });

}

module.exports = edit;

