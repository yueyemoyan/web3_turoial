// function deployFuntion() {
//     console.log("this is a deployee function")
// }
// module.exports.default=deployFuntion

const { network } = require("hardhat")
const {developmentChains, LOCK_TIME, networkConfig, Confirmations} = require("../helper-hardhat-config")

// module.exports = async(hre) => {
//     const getNameAccounts = hre.getNameAccounts
//     const deployee = hre.deployments
//     console.log("this is a deployee function")
// }

module.exports = async({getNamedAccounts, deployments}) =>{
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments

    let dataFeeAddr
    let confirmations
    if(developmentChains.includes(network.name)){
        const mockDataFeed = await deployments.get("MockV3Aggregator")
        dataFeeAddr = mockDataFeed.address
        confirmations = 0
    }else{
        dataFeeAddr =  networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = Confirmations
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, mockDataFeed.address],
        log: true,
        waitConfirmations: confirmations
    })

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, mockDataFeed.address]
          });
    } else {
        console.log("Network is not sepolia, verifycation skip")
    }
    

    module.exports.tags = ["all", "fundme"]
}

