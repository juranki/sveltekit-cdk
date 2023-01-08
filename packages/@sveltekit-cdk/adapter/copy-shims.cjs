const fs = require('fs')
const path = require('path')

fs.copyFileSync('shims.js', path.join('lib', 'files', 'shims.js'))