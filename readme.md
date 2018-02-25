# Requirise-wasm

A utility module to convert wasm to a requirable buffer object that you can pass to WebAssembly.instantiate or WebAssembly.Module.

## Installation

```sh
npm i requirise-wasm
```

## Usage

This module is best used in a command line context, but it has an exported API you can make use of

### Command line usage

```sh
requirise-wasm -i ./module.wasm -o ./module.wasm.js
```

Using `requirise-wasm -h` will print the following:

```sh
Usage: requireise-wasm [opts]

Available options:

  -i/--input PATH
        The path to the input WASM. Not needed if piping into this tool.
  -o/--output PATH
        The path to the output requirable file. Not needed if piping out from this tool.
  -v/--version
        Print the version.
  -h/--help
        Print this menu.
```

### Programmatic usage

This module exports a function that can take a buffer and return a string that you can write to a file.

```js
const requirise = require('requirise-wasm')
const fs = require('fs')

const someWASM = fs.readFileSync('/path/to/some.wasm')
const requirableString = requirise(someWasm)
fs.writeFileSync('/path/to/some.wasm.js')
```

### Using the WASM you just wrote to a file

To use the WASM you just wrote to a file, simply require it and pass it to `WebAssembly.Module` or `WebAssembly.instantiate`

```js
const wasmBuffer = require('/path/to/some.wasm.js')

// export a WASM module that is initialised synchronously
module.exports = new WebAssembly.Instance(WebAssembly.Module(wasmBuffer))
```

## License
MIT
