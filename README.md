# rollup-plugin-directives

<p>
    <a href="https://www.npmjs.com/package/rollup-plugin-directives" alt="Npm version">
        <img src="https://img.shields.io/npm/v/rollup-plugin-directives">
    </a>
</p>

 C# like preprocessor directives for javascript

## Install

```sh
npm i --save-dev rollup-plugin-directives
```

## Usage

rollup.config.js :

```js
import directives from 'rollup-plugin-directives';

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
Required. Type: `string || Array<string>`

One or a list of script names to process, all other files will be ignored.

### exclude
Required. Type: `string || Array<string>`

One or a list of script names to ignore, ignores a file even if present in the include option.

## Motivation

When building with rollup, sometimes we would want to conditionally include/exclude code or have different code for a build preset. This is useful when building separately for different plaatforms, or different versions of used libraries/software.

The classic way in which this is done in popular js bundlers, is to replace a specific "if" statement condition with a true or a false, like this:

source code:
```js
if (MY_DIRECTIVE) {
    // my code
} else {
    // my different code
}
```
output code:
```js
if (true) {
    // my code
} else {
    // my different code
}
```
output code + treeshaking/minification:
```js
// my code
```

This is not ideal for these reasons:
- when building in dev mode,  for performance reasons developers disable treeshaking/minification, in this case additional unused code and chunks are generated, resulting in useless pollution in the dist folder and in the browser's console.
- when using dynamic imports conditionally, problems can arise relatively to all the other plugins used, and builds still include the imports and their refrences further causing runtime errors.