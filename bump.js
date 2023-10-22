const fs = require('fs')
const path = require('path')
const yargsParser = require('yargs-parser')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

const argv = yargsParser(process.argv.slice(2))
const version = argv.version || argv.v

if (!version || !/\d+\.\d+\.\d+/.test(version)) {
    throw new Error('Provide a valid version to bump, for example `npm run bump -- --version 15.1.0`')
}

const packageFiles = ['package.json', 'package-lock.json']
packageFiles.forEach((name) => {
    const filePath = path.resolve(process.cwd(), name)
    const contents = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(contents)
    const indent = detectIndent(contents).indent
    const newline = detectNewline(contents)
    json.version = version

    if (json?.scripts?.download) {
        // bump version in download script
        json.scripts.download = json.scripts.download.replace(/\d+\.\d+\.\d+/, version)
    }

    if (json.packages && json.packages['']) {
        // package-lock v2 stores version there too
        json.packages[''].version = version
    }

    const newContents = stringifyPackage(json, indent, newline)
    fs.writeFileSync(filePath, newContents, 'utf8')
})

function stringifyPackage (data, indent, newline) {
    const CRLF = '\r\n'
    const LF = '\n'
    const json = JSON.stringify(data, null, indent)

    if (newline === CRLF) {
        return json.replace(/\n/g, CRLF) + CRLF
    }

    return json + LF
}

console.log(`Version is bumped to ${version}, please run \`npm run download\` and \`npm run generate\` to update the data.`)
