# Preprocess directives library

<p>
    <a href="https://www.npmjs.com/package/@preprocess-directives/lib" alt="Npm version">
        <img src="https://img.shields.io/npm/v/@preprocess-directives/lib">
    </a>
</p>

 C# like preprocessor directives library for javascript

 NB: 
 - It's recommended to use the cjs version of this library, when using it via NodeJS as it uses the more reliable 'path' tool
 - the esm version needs to be imported from '@preprocess-directives/lib/dist/index.esm.js'

## Install

```sh
npm i @preprocess-directives/lib
```

## Usage
esm:
```js
import process from '@preprocess-directives/lib/dist/index.esm.js';

// example of code generated at runtine, for ex with a front-end code editor
let codeName = 'User generated script';
let code = `
class MyClass {

#if MY_DIRECTIVE
    myFunction = (data) => {
        return data;
    }
#else
    myFunction = (differentData) => {
        return differentData;
    }
#endif
`;

code = process(code, {defines: ['MY_DIRECTIVE'], log: false, fileAdress: codeName});

// do whatever with processed code
```
node:
```js
const fs = require('fs');
const process = require('@preprocess-directives/lib').default;

// read source file
let filePath = 'src/index.js';
let code = fs.readFileSync(filePath, 'utf-8');

code = process(code, {
    defines: ['MY_DIRECTIVE'],
    log: false,
    fileAdress: filePath,
    mode: 'both',
});

// generate processed file
fs.writeFileSync('dist/app.js', code, 'utf-8');
```

source code example:

```js
class MyClass {

#if MY_DIRECTIVE
    myFunction = (data) => {
        return data;
    }
#else
    myFunction = (differentData) => {
        return differentData;
    }
#endif

}
```

## Options

### defines
Required. Type: `Array<string>`

List of defines based on which to validate `#if` statements.

### log
Type: `boolean`

Wether to show this process logs or not, like skipped files and number of #if groups found.

### filePath
Type: `string`

Path or Url of the script (only needed when logging).

### mode
Type: `string`

Values: `"plain"|"commented"|"both"`

Wether to process when directives are written plainly or used in a comment. Default value is "both".
```txt
commented -> "//#if", "//#else", ... and "//#post-code let exampleVar = 5;"
plain     -> "#if", "#else", ... ("#post-code" not available)
```

<details>
<summary>
  <h1 style="display:inline-block">Changelog</h1>
  <span style="white-space: pre;">    (click)</span>
</summary>

### v 1.1
- added negative #if check (#if !value)

### v 1.2
- added include & exclude files option

### v 1.3
- added optional debug logging

### v 1.3.1
- improved log messages

### v1.3.3
bugfixes:
- incorrect code output when an if-else statement is unfulfilled

changes:
- added debug log info on each processed "if group"
- better debug log formatting

### v1.4.0

- Separated processing functions from plugin in a separate library.
This allows for use with node & for other plugins.

### v1.5.0

- Browser support (esm version now doesn't use any node dependency)

### v1.6.0

- Added commented directives mode

</details>