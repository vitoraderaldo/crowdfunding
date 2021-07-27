const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const {abi, bytecode} = require('./build/CampaignFactory.json')

const provider = new HDWalletProvider(
    process.env.mnemonic,
    process.env.etherum_api
)

const web3 = new Web3(provider)

const deploy = async () => {
    // Get the account
    const accounts = await web3.eth.getAccounts()
    console.log(`Attempting to deploy from account ${accounts[0]}`)
    // Defines the contract interface (ABI) to web3
    const contract = new web3.eth.Contract(JSON.parse(abi))
    // Creates the transaction data that represents the contract   
    const transaction = await contract.deploy({data: bytecode})
    // Sends the transaction to the Etherum Network
    const deployedContract = await transaction.send({
        from: accounts[0], 
        gas: '1000000'
    })
    console.log(`The contract was deployed at: ${deployedContract.options.address}`)
}

deploy()
