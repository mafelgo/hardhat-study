// staging里面的测试是针对在线测试网络的，而非本地的hardhat网络或者localhost网络
// 因此这里加了一个判断条件：如果包含 network.name，则skip，不然就继续后面的代码
// 参考 return a? 3 : 2 ;

const { assert } = require("chai")
const { ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) // 条件
    ? describe.skip // true
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
