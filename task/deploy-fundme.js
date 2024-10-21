const { task } = require("hardhat/config")
 
task("deploy-fundme", "deploy and verify fundme contract").setAction(async(taskArgs, hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(10)
    //等待交易入块

    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`)

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY){
        console.log("waiting for 5 confirmations")
        // 等待5个区块
        await fundMe.deploymentTransaction().wait(5)
        // 进行js验证
        await verifyFundMe(fundMe.target, [100])
    }else{
        console.log("verify skipped... ")
    }
})

async function verifyFundMe(fundMeAddress, args){
    await hre.run("verify:verify", {
        address: fundMeAddress,
        constructorArguments: args
      });
}

module.exports = {}