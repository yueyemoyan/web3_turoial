
const {ethers} = require("hardhat")
const { EDIT_DISTANCE_THRESHOLD } = require("hardhat/internal/constants")

async function main(){
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


    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners()

    // fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.00000001")})
    await fundTx.wait()

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContract}`)

    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0000000000000000001")})
    await fundTxWithSecondAccount.wait()

    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`)

    //check mapping
    const firstAccountBalanceInFunsMe = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountBalanceInFunsMe}`)
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`)
}

async function verifyFundMe(fundMeAddress, args){
    await hre.run("verify:verify", {
        address: fundMeAddress,
        constructorArguments: args
      });
}

main().then().catch((err) => {
    console.log(err)
    process.exit(0)
})