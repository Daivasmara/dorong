const fs = require('fs')
const colors = require('colors')

const { PT_API_KEY_FILE } = require('../constants')

module.exports = function apiKey(argv) {
  try {
    fs.writeFileSync(PT_API_KEY_FILE, argv.apiKey)
    console.log('Pivotal Tracker API key is now successfully stored on your local machine.'.green)
  } catch (err) {
    console.log('Permission denied, you need to use sudo'.red)
    process.exit(1)
  }
}
