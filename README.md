# Preprocess-directives


C# like preprocessor directives for javascript

```c#
#if MY_DIRECTIVE
// my code
#else
// my different code
#endif
```

## Packages

Currently these packages are included in the project:
- [`@preprocess-directives/rollup-plugin`](./Packages/rollup-plugin)

## Motivation

When building with rollup, sometimes we would want to conditionally include/exclude code or have different code for a build preset. This is useful when building separately for different plaatforms, or different versions of used libraries/software.

### The problem
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