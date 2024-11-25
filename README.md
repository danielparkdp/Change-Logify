# Logify
AI Powered Changelogs generator for Devs!

Ideas:
Leverage the power of git, intuitive for devs

Use 
`git log --oneline --no-decorate`

Alternative to/works with
`git tag`

if run with --local, runs local logify.json (default path)



Setup:
Requires LLMs; can use OpenAI or Gemini simply by setting up your keys!
Create a home directory .env file:
`mkdir ~/.logify`
`vim ~/.logify/.env`
Paste in:
`OPENAI_API_KEY=___`
`GOOGLE_API_KEY=___`

Run
`npm install -g ./logify`

