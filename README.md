# Logify
AI Powered Changelogs generator for Devs!


## Setup:
Requires LLMs; can use OpenAI or Gemini simply by setting up your keys!
Create a home directory .env file:
`mkdir ~/.logify`
`vim ~/.logify/.env`

Paste in:
`OPENAI_API_KEY=___`
`GOOGLE_API_KEY=___`

Run
`npm install -g ./logify`

Setup logify in a repo by picking where to store logify files
`logify init`

Then, generate logs using:
`logify`

Simple as that! 

Flags exist for customization (ex. -g for Gemini, -s to select specific commits, etc.)

`logify log`, `logify revert`, and `logify edit` all do exactly what you might think they do.

`logify build` generates an HTML based on a template (that you can customize if needed)

Once you have the html generated, run:
`npm start` to demo


## Ideas:
- Leverage the power of git/github for source of truth, intuitive for devs
    - Generally tries to integrate commonly used dev experience
    - Don't need to teach devs how to log, init, etc.
- Simple command line that you can intuitively use
- Quickness is important + customizability/editing
- Quick build for demo


Thanks for trying and was a fun project!

