const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');
const envPath = path.join(os.homedir(), '.logify', '.env');
dotenv.config({ path: envPath });
const { summarize_short } = require("./prompts/prompts");
const axios = require('axios');
const fs = require('fs');


const logify = async (options) => {
    let gitLog;
    try {
        gitLog = execSync('git log --oneline --no-decorate').toString();
    } catch (error) {
        return
    }
    let gitLogArray = parseGitLog(gitLog)
    

    // TODO: Check compare with logged commits, then check for listed commits, then check for select
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
        console.error('\x1b[31mFailed to read logify.json file\x1b[0m');
        return;
    }
    const logifyMap = logifyJsonContent.changelogs;
    const seenCommits = new Set();
    logifyMap.forEach(changelog => {
        changelog.commits.forEach(commit => {
            seenCommits.add(commit);
        });
    });
    // Specified commits only
    if (options.list && options.list.length > 0) {
        gitLogArray = gitLogArray.filter(entry => options.list.includes(entry[0]));
    } else {
        gitLogArray = gitLogArray.filter(entry => !seenCommits.has(entry[0]));
    }

    // Select commits
    if (options.select) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const includeResponses = [];
        for (const entry of gitLogArray) {
            const response = await new Promise(resolve => {
                rl.question(`Do you want to include the entry \x1b[90m${entry[0]}: ${entry[1]}\x1b[0m (Y/N)? `, (answer) => {
                    resolve(answer.toLowerCase() === 'y');
                });
            });
            includeResponses.push(response);
        }
        rl.close();
        gitLogArray = gitLogArray.filter((_, index) => includeResponses[index]);
    }

    let remadeGitLog = gitLogArray.map(entry => entry.join(' ')).join('\n');
    
    if (gitLogArray.length === 0) {
        console.log('\x1b[1mNo new commits detected!\x1b[0m');
        return;
    }


    // Get versions
    const latestVersion = logifyMap[logifyMap.length - 1].version;
    let newVersion;
    if (options.release) {
        const releaseFormat = /^(v?\d+\.\d+\.\d+)$/;
        if (!releaseFormat.test(options.release)) {
            console.error('\x1b[31mInvalid release format. Please follow standard release formating (ex. v0.0.1)\x1b[0m');
            return;
        }
        if (options.release.startsWith('v')) {
            options.release = options.release.slice(1);
        }
        newVersion = `v${options.release}`;
    } else {
        newVersion = `${latestVersion.split('.')[0]}.${latestVersion.split('.')[1]}.${parseInt(latestVersion.split('.')[2], 10) + 1}`;
    }
    

    // AI Summary
    let llm_response;
    if (options.google) {
        API_KEY = process.env.GOOGLE_API_KEY;
        const prompt = summarize_short(remadeGitLog);
        const headers = {
            'Content-Type': 'application/json'
        };
        const data = {"contents": [{"parts": [{"text": prompt}]}]};
        const model = "gemini-1.5-flash"
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, data, { headers });
        const gptResponse = response.data;
        llm_response = (gptResponse.candidates[0].content.parts[0].text);
    } else {
        API_KEY = process.env.OPENAI_API_KEY;
        const prompt = summarize_short(remadeGitLog);
        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        };
        const data = {
            "model": "gpt-4o-mini",
            "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
        };
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, { headers });
        const gptResponse = response.data;
        llm_response = (gptResponse.choices[0].message.content);
    }

    const newEntry = {
        "version": newVersion,
        "timestamp": new Date().toISOString(),
        "commits": gitLogArray.map(entry => entry[0]),
        "log": llm_response
    };

    const logifyJson = require(logifyJsonPath);
    logifyJson.changelogs.push(newEntry);

    fs.writeFileSync(logifyJsonPath, JSON.stringify(logifyJson, null, 2));

    const publishMessage = `\x1b[1m${newVersion} published:\x1b[0m\n${llm_response}`;
    for (let i = 0; i < publishMessage.length; i++) {
        process.stdout.write(publishMessage[i]);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    console.log("\x1b[1m\nSuccess! To undo log, run \x1b[3mlogify revert\x1b[0m\x1b[1m.\x1b[0m")

};

const parseGitLog = (gitLog) => {
    return gitLog.split('\n').map(line => {
        const [commit, ...rest] = line.split(' ');
        if (commit) {
            return [commit, rest.join(' ')];
        }
        return null;
    }).filter(Boolean);
}



module.exports = logify;
