const fs = require('fs')
const path = require('path')

fs.copyFileSync(path.join(__dirname, 'shims.js'), path.join(__dirname, 'dist', 'files', 'shims.js'))