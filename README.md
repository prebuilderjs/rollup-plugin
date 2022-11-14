# Prebuilder rollup plugin

<p>
    <a href="https://www.npmjs.com/package/@prebuilder/rollup-plugin" alt="Npm version">
        <img src="https://img.shields.io/npm/v/@prebuilder/rollup-plugin">
    </a>
</p>

 C# like preprocessor directives for javascript

## Install

```sh
npm i --save-dev @prebuilder/rollup-plugin
```

## Usage

rollup.config.js :

```js
import prebuilder from '@prebuilder/rollup-plugin';

let myDefines = [ 'MY_DIRECTIVE' ]

export default {
    input: "** your input **",
    output: {
        file: "** your output **",
    },
    plugins: [
        prebuilder({ defines: myDefines }),
    ],
}
```

source code :

```c#
class MyClass {

// if else directives:
#if MY_DIRECTIVE
    myFunction = (data) => {
        return data;
    }
#else
    myFunction = (differentData) => {
        return differentData;
    }
#endif

// commented mode & #if negative check:
//#if !MY_DIRECTIVE
    myVar = {
        number: 0
    };
//#else
    //#post-code myVar = {
    //#post-code     number: 5
    //#post-code };
//#endif

}
```

output code :

```js
class MyClass {

    myFunction = (data) => {
        return data;
    }

    myVar = {
        number: 5
    };
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

### mode
Type: `string`

Values: `"plain"|"commented"|"both"`

Wether to preprocess directives written plainly `#if` or in a comment `//#if`. Default value is "both".
```txt
commented -> "//#if", "//#else", ... and "//#post-code let exampleVar = 5;"
plain     -> "#if", "#else", ... ("#post-code" not available)
```

## Differences
The differences between this rollup plugin, and [`@prebuilder/rollup`](https://github.com/prebuilderjs/rollup) are:
|                                               |        pb-rollup      |   rollup-plugin   |
|    ---                                        |          :---:        |      :---:        |
| faster processing                             | ❌<br>manages files +<br>processes them                    | ✔ <br>processes files              |
| Not affected by configuration<br>edge cases   | ✔                    | ❌<br>can become unusable for<br> complex rollup configs,<br> depending on what other<br> plugin is used ¹                |

¹ ) If, for example, using the typsescript rollup plugin which seems to manage .ts files on non-transform hooks, [`@prebuilder/rollup`](https://github.com/prebuilderjs/rollup) is then more suitable.

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

### v1.3.4

- Separated processing functions from plugin in a separate library.
This allows for use with node & for other plugins.

### v1.3.5

- Update to rollup 3

### v1.4.0

- Added commented directives mode

</details>