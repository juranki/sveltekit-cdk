const writeFileSync = require('fs').writeFileSync
writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }))
writeFileSync('dist/mjs/package.json', JSON.stringify({ type: 'module' }))