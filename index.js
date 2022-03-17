#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require("child_process")
const colors = require('colors')
const fetch = require('node-fetch')
const { snakeCase } = require('snake-case')

const API_KEY_FILE = `${__dirname}/api_key`
const ENDPOINT = 'https://www.pivotaltracker.com/services/v5/stories'

require('yargs')
  .scriptName("dorong")
  .usage('$0 <cmd> [args]')
  .command('api-key [apiKey]', 'store API key in your local machine', (yargs) => {
    yargs.positional('apiKey', {
      type: 'string',
      describe: 'Pivotal Tracker Story ID'
    })
  }, function (argv) {
    try {
      fs.writeFileSync(API_KEY_FILE, argv.apiKey)
      console.log('API key is now successfully stored on your local machine.')
    } catch (err) {
      console.log('Permission denied, you need to use sudo')
      process.exit(1)
    }
  })
  .command('pt [storyId]', 'push MR to branch', (yargs) => {
    yargs.positional('storyId', {
      type: 'string',
      describe: 'Pivotal Tracker Story ID'
    })
  }, async function (argv) {
    let apiKey

    try {
      apiKey = fs.readFileSync(API_KEY_FILE, 'utf8')
    } catch (err) {
      console.log('You need to store API key first')
      process.exit(1)
    }

    try {
      const response = await fetch(`${ENDPOINT}/${argv.storyId}`, {
        headers: { 'X-TrackerToken': apiKey }
      })
      const data = await response.json()
      const branchName = `${argv.storyId}/${snakeCase(data.name)}`
      const commitMessage = `[#${argv.storyId}] ${data.name}`

      execSync(`git checkout -b ${branchName}`)
      execSync(`git commit -m "${commitMessage}"`)
      const output = execSync(`git push -u origin ${branchName}`)
      console.log(output.toString())
    } catch (err) {
      console.log(colors.red(err.message))
      process.exit(1)
    }
  })
  .demandCommand()
  .argv
