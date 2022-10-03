# Preprocess directives rollup plugin

<p>
    <a href="https://www.npmjs.com/package/rollup-plugin-directives" alt="Npm version">
        <img src="https://img.shields.io/npm/v/rollup-plugin-directives">
    </a>
</p>

 C# like preprocessor directives for javascript

## Install

```sh
npm i --save-dev @preprocess-directives/rollup-plugin
```

## Usage

rollup.config.js :

```js
import directives from '@preprocess-directives/rollup-plugin';

let myDefines = [ 'MY_DIRECTIVE' ]

export default {
    input: "** your input **",
    output: {
        file: "** your output **",
    },
    plugins: [
        directives({ defines: myDefines }),
    ],
}
```

source code :

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

output code :

```js
class MyClass {

    myFunction = (data) => {
        return data;
    }
}
```

## Options

### defines
Required. Type: `Array<string>`

List of defines based on which to validate `#if` statements.

### include
Type: `string || Array<string>`

One or a list of script names to process, all other files will be ignored.

### exclude
Type: `string || Array<string>`

One or a list of script names to ignore, ignores a file even if present in the include option.

### log
Type: `boolean`

Wether to show this plugin's logs or not, like skipped files and number of #if groups found.