const fs = require('fs')
const colors = require('colors')

const { API_KEY_FILE } = require('../constants')

module.exports = function apiKey(argv) {
  try {
    fs.writeFileSync(API_KEY_FILE, argv.apiKey)
    console.log('API key is now successfully stored on your local machine.'.green)
  } catch (err) {
    console.log('Permission denied, you need to use sudo'.red)
    process.exit(1)
  }
}
