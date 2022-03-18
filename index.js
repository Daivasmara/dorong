#!/usr/bin/env node

const fs = require('fs')
const { execSync } = require("child_process")
const inquirer = require('inquirer')
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
      console.log('API key is now successfully stored on your local machine.'.green)
    } catch (err) {
      console.log('Permission denied, you need to use sudo'.red)
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
      console.log('You need to store API key first'.red)
      process.exit(1)
    }

    try {
      const response = await fetch(`${ENDPOINT}/${argv.storyId}`, {
        headers: { 'X-TrackerToken': apiKey }
      })
      const data = await response.json()
      const branchName = `${argv.storyId}/${snakeCase(data.name)}`
      const commitPrefix = `[#${argv.storyId}]`
      const commitMessage = data.name

      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      const defaultBranch = execSync("git remote show origin | sed -n '/HEAD branch/s/.*: //p'").toString().trim()

      if (currentBranch !== branchName) {
        execSync(`git checkout -b ${branchName}`)
      }

      const commitAhead = Number(execSync(`git rev-list --count origin/${defaultBranch}...${branchName}`).toString().trim())

      const questions = []

      if (commitAhead === 1) {
        questions.push({
          type: 'confirm',
          name: 'amend',
          message: `We detect 1 commit ahead of ${defaultBranch}, do you want to amend?`,
          default: false,
        })
      }

      questions.push(
        {
          type: 'input',
          name: 'commitMessage',
          message: 'Commit message: ',
          default: commitMessage,
          suffix: commitPrefix,
          when(answers) {
            return !answers.amend
          },
        },
        {
          type: 'confirm',
          name: 'push',
          message: `Push to branch`,
          default: false,
        }
      )

      inquirer
        .prompt(questions)
        .then((answers) => {
          if (answers.amend) {
            execSync(`git commit --amend --no-edit --reset-author`)
          } else {
            execSync(`git commit -m "${commitPrefix} ${answers.commitMessage}"`)
          }

          if (answers.push) {
            if (answers.amend) {
              const output = execSync(`git push -f origin ${branchName}`).toString().trim()
              console.log(output)
              process.exit(1)
            }

            const output = execSync(`git push -u origin ${branchName}`).toString().trim()
            console.log(output)
            process.exit(1)
          }
        })
        .catch((err) => {
          console.log(colors.red(err.message))
          process.exit(1)
        })
    } catch (err) {
      console.log(colors.red(err.message))
      process.exit(1)
    }
  })
  .demandCommand()
  .argv
