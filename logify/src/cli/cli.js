#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const logify = require("./commands/logify");

// Default logify behavior
program
  .description('Logify is an AI-powered changelog generation tool!')
  .option('-l, --list <names...>', 'Specify a list of commits to include', [])
  .option('-s, --select', 'Select which commits to include')
  .option('-o, --openai', 'Use OpenAI Key', false)
  .option('-g, --google', 'Use Google Gemini Key', false)
  .action((options) => {
    logify(options);
  });

// Define diff with live
program
  .command('diff')
  .description('Diff with live')
  .action(() => {
    console.log('TODO: Diffing!');
  });

// Define pulling from live and update
program
  .command('pull')
  .description('Pull from live')
  .action(() => {
    console.log('TODO: Pulling!');
  });

// Define pushing to live and generate default page
program
.command('push')
.description('Push to live')
.action(() => {
  console.log('TODO: Pushing and default page!');
});


program.parse(process.argv);
