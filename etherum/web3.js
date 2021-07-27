import Web3 from "web3"
 
let web3

const isRunningOnTheBrowser = () => {
    return typeof window !== "undefined"
}

const isRunningMetamask = () => {
    return typeof window.ethereum !== "undefined"
}
 
if (isRunningOnTheBrowser() && isRunningMetamask()) {
    window.ethereum.request({ method: "eth_requestAccounts" })
    web3 = new Web3(window.ethereum)
} else {
    const provider = new Web3.providers.HttpProvider(
        "https://rinkeby.infura.io/v3/a52fa18d4c344e14813205f82ea2ac1b"
    )
    web3 = new Web3(provider)
}

export default web3