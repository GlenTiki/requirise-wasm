#!/usr/bin/env node

const minimist = require('minimist')
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const help = fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8')

function parseArgs (argvs) {
  const argv = minimist(argvs, {
    boolean: ['help', 'version'],
    alias: {
      input: 'i',
      output: 'o',
      version: 'v',
      help: 'h'
    }
  })

  if (argv.version) {
    console.log('requirise-wasm', 'v' + require('./package').version)
    console.log('node', process.version)
    return
  }

  if (argv.help) {
    console.error(help)
    return
  }

  const options = {}

  if (argv.output) {
    options.output = argv.output
  } else if (!process.stdout.isTTY) {
    options.output = false
  } else throw new Error('output option must be providedif not piping out somewhere')

  if (argv.input) {
    argv.input = path.isAbsolute(argv.input) ? argv.input : path.join(process.cwd(), argv.input)
    options.input = fs.readFileSync(argv.input)
    handle(options)
  } else if (!process.stdin.istty) {
    options.input = ''
    process.stdin.on('data', (chunk) => {
      if (chunk !== null) {
        options.input = options.input + chunk.toString()
      }
    })

    process.stdin.on('end', () => {
      options.input = Buffer.from(options.input)
      handle(options)
    })
  } else throw new Error('input option must be provided if not being piped into')
}

function handle (options) {
  const content = requireiseWasm(options.input)

  if (options.output) {
    options.output = path.isAbsolute(options.output) ? options.output : path.join(process.cwd(), options.output)

    fs.writeFile(options.output, content, err => {
      if (err) {
        console.error(err)
        return
      }
      console.log('Finished requirising wasm, wrote to file:', options.output)
    })
  } else {
    console.log(content)
  }
}

function requireiseWasm (input) {
  assert(Buffer.isBuffer(input), 'input provided to requirise WASM must be a buffer')

  let outputFileContent = `
    const base64 = '${input.toString('base64')}'

    let bytes
    if (typeof Buffer === 'undefined') {
      bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    } else {
      bytes = Buffer.from(base64, 'base64')
    }

    module.exports = bytes
  `

  return outputFileContent
}

if (require.main === module) {
  parseArgs(process.argv)
} else {
  module.exports = requireiseWasm
}
