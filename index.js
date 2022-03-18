#!/usr/bin/env node

const apiKeyCommand = require('./commands/pt-api-key')
const ptCommand = require('./commands/pt')

require('yargs')
  .scriptName("dorong")
  .usage('$0 <cmd> [args]')
  .command('pt-api-key [apiKey]', 'store Pivotal Tracker API key in your local machine', (yargs) => {
    yargs.positional('apiKey', {
      type: 'string',
      describe: 'Pivotal Tracker Story ID'
    })
  }, apiKeyCommand)
  .command('pt [storyId]', 'push MR to branch', (yargs) => {
    yargs.positional('storyId', {
      type: 'string',
      describe: 'Pivotal Tracker Story ID'
    })
  }, ptCommand)
  .demandCommand()
  .argv
