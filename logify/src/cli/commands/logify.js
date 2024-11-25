const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');
const envPath = path.join(os.homedir(), '.logify', '.env');
dotenv.config({ path: envPath });
const { summarize_short } = require("./prompts/prompts");
const axios = require('axios');


const logify = async (options) => {
    console.log(options)
    let gitLog;
    try {
        gitLog = execSync('git log --oneline --no-decorate').toString();
    } catch (error) {
        return
    }
    const gitLogArray = parseGitLog(gitLog)
    console.log(gitLogArray)
    

    // TODO: Check compare with logged commits, then check for listed commits, then check for select



    // AI Summary
    let llm_response;
    if (options.google) {
        API_KEY = process.env.GOOGLE_API_KEY;
        const prompt = summarize_short(gitLog);
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
        const prompt = summarize_short(gitLog);
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

    console.log(llm_response)

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
