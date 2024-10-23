const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("test fundme contract", async function () {

    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator
    // 在每次执行下面的it之前都会执行这个方法
    this.beforeEach(async function(){
        deployments.fixture(["all"])
        firstAccount = await getNamedAccounts().firstAccount
        secondAccount = await getNamedAccounts().secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })

    it("test if the owner is msg.sender", async function () {
        // 以下参数会从上面的beforeEach中获取
        // const [firstAccount] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FuneMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), firstAccount)
    })

    it("test if the datafeed is assigned correctly", async function () {
        // const fundMeFactory = await ethers.getContractFactory("FuneMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)
    })

    // fund, getFund, reFund
    // unit test for fund
    // window open,value greater than minimum value, funder balance
    it("window closed, value is grater than minimum, fund failed", 
        async function(){
            await helpers.time.increase(200)
            await helpers.mine()
            // value is greater than minimum
            expect(fundMe.fund({value: ethers.parseEther("0.1")}))
                .to.be.rejectedWith("windows is closed")
        }
    )

    it("window closed, value is less than minimum, fund failed",
        async function(){
            expect(fundMe.fund({value: ethers.parseEther("0.01")}))
                .to.be.rejectedWith("send more ETH")
        }
    )

    it("window open, value is greater minimum, fund success",
        async function(){
            await fundMe.fund({value: ethers.parseEther("0.1")})
            const balance = fundMe.fundersToAmount(firstAccount)
            expect(balance).to.equal(ethers.parseEther("0.1"))
        }
    )

    // unit test for getFund
    // olyOwner, windowClose, target reached
    it("olyOwner, windowClose, target reached",
        async function(){
            await helpers.time.increase(200)
            await helpers.mine()
            await fundMe.fund({value: ethers.parseEther("1")})
            expect(fundMeSecondAccount.getFund()).to.be.revertedWith("this funciton can only be called by owner")
        }
    )

    it("window closed",
        async function(){
            await fundMe.fund({value: ethers.parseEther("1")})
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.getFund())
            .to.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"))
        }
    )
})