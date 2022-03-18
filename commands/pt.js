const fs = require('fs')
const { execSync } = require("child_process")
const inquirer = require('inquirer')
const colors = require('colors')
const fetch = require('node-fetch')
const { snakeCase } = require('snake-case')

const { API_KEY_FILE, ENDPOINT } = require('../constants')

module.exports = async function (argv) {
    let apiKey

    try {
      apiKey = fs.readFileSync(API_KEY_FILE, 'utf8')
    } catch (err) {
      console.log('You need to store API key first'.red)
      process.exit(1)
    }

    try {
      const stagedFilesCount = Number(execSync('git diff --cached --numstat | wc -l').toString().trim())
      if (!stagedFilesCount) {
        console.log('No staged files'.red)
        process.exit(1)
      }

      const response = await fetch(`${ENDPOINT}/${argv.storyId}`, {
        headers: { 'X-TrackerToken': apiKey }
      })
      const data = await response.json()
      const branchName = `${argv.storyId}/${snakeCase(data.name)}`
      const commitPrefix = `[#${argv.storyId}]`
      const commitMessage = data.name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

      const questions = [
        {
          type: 'confirm',
          name: 'useCurrentBranch',
          message: `Use current branch (${currentBranch})`,
          default: false,
        },
        {
          type: 'input',
          name: 'commitMessage',
          message: 'Commit message: ',
          default: commitMessage,
          suffix: commitPrefix,
        },
        {
          type: 'confirm',
          name: 'push',
          message: `Push to branch`,
          default: false,
        },
      ]

      inquirer
        .prompt(questions)
        .then((answers) => {
          if (!answers.useCurrentBranch) {
            execSync(`git checkout -b ${branchName}`)
          }

          execSync(`git commit -m "${commitPrefix} ${answers.commitMessage}"`)

          if (answers.push) {
            const output = execSync(`git push -u origin ${branchName}`).toString().trim()
            console.log(output)
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
  }
