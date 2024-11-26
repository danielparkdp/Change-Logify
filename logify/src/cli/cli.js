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
  .option('-r, --release <version>', 'Release version, default increments latest patch')
  .option('-o, --openai', 'Use OpenAI Key', false)
  .option('-g, --google', 'Use Google Gemini Key', false)
  .action((options) => {
    logify(options);
  });

// Revert last change
program
  .command('revert')
  .description('Revert last changelog')
  .action(() => {
    console.log('TODO: Reverting!');
  });

// Revert last change
program
  .command('edit')
  .description('Edit specified changelog')
  .action(() => {
    console.log('TODO: Editing!');
  });

// Define log
program
  .command('log')
  .description('List recent versions published')
  .action(() => {
    console.log('TODO: LOGGING')
  });

// Define init
program
  .command('init')
  .description('Initiate logify in repo')
  .action(() => {
    init()
  });



program.parse(process.argv);
