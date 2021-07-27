const path = require('path')
const solc = require('solc')
const fs = require('fs-extra')

// Remove previous builds
const buildPath = path.resolve(__dirname, 'build')
fs.removeSync(buildPath)

// Compile the contracts
const campaingPath = path.resolve(__dirname, 'contracts', 'Campaign.sol')
const source = fs.readFileSync(campaingPath, 'utf-8')
const output = solc.compile(source, 1).contracts

// Save the compiled contracts
fs.ensureDirSync(buildPath)
for (let contractKey in output) {
    fs.outputJSONSync(
        path.resolve(buildPath, contractKey.replace(':', '') + '.json'),
        output[contractKey]
    )
}