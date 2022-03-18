const fs = require('fs')
const { execSync } = require("child_process")
const inquirer = require('inquirer')
const colors = require('colors')
const fetch = require('node-fetch')
const { snakeCase } = require('snake-case')

const { PT_API_KEY_FILE, PT_ENDPOINT } = require('../constants')

module.exports = async function (argv) {
    let apiKey

    try {
      apiKey = fs.readFileSync(PT_API_KEY_FILE, 'utf8')
    } catch (err) {
      console.log('You need to store Pivotal Tracker API key first'.red)
      process.exit(1)
    }

    try {
      const stagedFilesCount = Number(execSync('git diff --cached --numstat | wc -l').toString().trim())
      if (!stagedFilesCount) {
        console.log('No staged files'.red)
        process.exit(1)
      }

      const response = await fetch(`${PT_ENDPOINT}/${argv.storyId}`, {
        headers: { 'X-TrackerToken': apiKey }
      })
      const data = await response.json()
      const branchName = `${argv.storyId}/${snakeCase(data.name)}`
      const commitPrefix = `[#${argv.storyId}]`
      const commitMessage = data.name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
      const defaultBranch = execSync("git remote show origin | sed -n '/HEAD branch/s/.*: //p'").toString().trim()
      const commitAhead = Number(execSync(`git rev-list --count origin/${defaultBranch}...${currentBranch}`).toString().trim())
      const useCurrentBranch = currentBranch === branchName

      const questions = [
        {
          type: 'confirm',
          name: 'useCurrentBranch',
          message: `Use current branch: ${colors.underline(currentBranch)}?`,
          default: false,
          when() {
            return !useCurrentBranch
          }
        },
        {
          type: 'confirm',
          name: 'squash',
          message: `We detect ${commitAhead} commit(s) ahead of ${defaultBranch}, squash?`,
          default: false,
          when() {
            return commitAhead
          },
        },
        {
          type: 'input',
          name: 'commitMessage',
          message: 'Commit message:',
          default: commitMessage,
          suffix: commitPrefix,
        },
        {
          type: 'confirm',
          name: 'push',
          message: 'Push to branch?',
          default: false,
        },
      ]

      inquirer
        .prompt(questions)
        .then((answers) => {
          if (!useCurrentBranch && !answers.useCurrentBranch) {
            execSync(`git checkout -b ${branchName}`)
          }

          if (answers.squash) {
            execSync(`git reset --soft HEAD~${commitAhead}`)
          }

          execSync(`git commit -m "${commitPrefix} ${answers.commitMessage}"`)

          if (answers.push) {
            const output = execSync(`git push ${answers.squash ? '-f' : ''} -u origin HEAD`).toString().trim()
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
