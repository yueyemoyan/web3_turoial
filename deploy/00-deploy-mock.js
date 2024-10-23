
const {developmentChains, DECIMAAL, INITIAL_ANSWER} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts, deployments}) =>{

    if(developmentChains.includes(network.name)){
        const {firstAccount} = await getNamedAccounts()
        const {deploy} = deployments
        
        const fundMe = await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAAL, INITIAL_ANSWER],
            log: true
        })
    } else {
        console.log("environment is not local, mock contract deployment is skiped")
    }

    module.exports.tags = ["all", "mock"]
}