#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const logify = require("./commands/logify");
const init = require("./commands/init");

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

// Define diff with another branch
program
  .command('diff')
  .description('Diff with live')
  .action(() => {
    console.log('TODO: Diffing!');
  });

// Define init
program
  .command('init')
  .description('Initiate logify in repo')
  .action(() => {
    init()
  });



program.parse(process.argv);
