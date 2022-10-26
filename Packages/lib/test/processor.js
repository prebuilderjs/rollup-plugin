const fs = require('fs');
const process = require('../dist/index.cjs').default;

// read source file
let filePath = 'test/source.js';
let code = fs.readFileSync(filePath, 'utf-8');

code = process(code, {
    defines: ['MY_DIRECTIVE'],
    log: true,
    fileAdress: filePath,
    mode: 'both',
});

// generate processed file
fs.writeFileSync('test/dist.js', code, 'utf-8');