#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const logify = require("./commands/logify");
const init = require("./commands/init");
const revert = require("./commands/revert");
const edit = require("./commands/edit");
const log = require("./commands/log");
const build = require("./commands/build");



const validSubCommands = ['init', 'revert', 'edit', 'log', 'build'];

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

// Define init
program
  .command('init')
  .description('Initiate logify in repo')
  .action(() => {
    init()
  });

// Revert last change
program
  .command('revert')
  .description('Revert last changelog')
  .option('-p, --patch <patches...>', 'Specify patches to revert')
  .action(options => {
    revert(options);
  });

// Edit change
program
  .command('edit')
  .description('View and edit specified or latest changelog')
  .option('-p, --patch <patch>', 'Specify patch to edit')
  .option('-n, --nano', 'Use Nano editor (bleh)')
  .action((options) => {
    edit(options)
  });

// Define log
program
  .command('log')
  .description('List recent versions published')
  .option('-p, --patch <patches...>', 'Specify patches to log')
  .action((options) => {
    log(options)
  });

// Define build
program
  .command('build')
  .description('Build logify logs into html for public view!')
  .option('-d, --destination <destination>', 'Optional path to save built html file')
  .action((options) => {
    build(options)
  });



program.parse(process.argv);

// Handle default behavior explicitly
const parsedArgs = program.opts();
let subCommandInvoked = process.argv.slice(2).some(arg => validSubCommands.includes(arg) && !arg.startsWith('-'));

if (!subCommandInvoked) {
  logify(parsedArgs);
}