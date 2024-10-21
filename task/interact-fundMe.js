const { task } = require("hardhat/config")
 
task("interact-fundme", "interact with fundme contract")
.addParam("addr", "fundme contract address")
.setAction(async(taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = fundMeFactory.attach(taskArgs.addr)
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
})

module.exports = {}