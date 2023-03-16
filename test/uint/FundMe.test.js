const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) // 条件
    ? describe.skip // true
    : describe(/*false*/ "FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") // 1ETH
          beforeEach(async function () {
              // 先把FundMe合约给部署了，使用Hardhat-deploy

              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0]; 这个写法和下面这句话是类似的
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // fixture函数的功能是部署所有包含括号里的tags的js，
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds funders to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              // 因为是提取资金，那前提就是，里面必须要有钱
              // 所以就fund一点钱进去先
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single foulder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(
                          fundMe.address // 一开始合约内有多少钱
                      )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(
                          deployer // 一开始deployer有多少钱
                      )
                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance), // 这里用add是因为数据类型将会是big number，普通的+不行
                      endingDeployerBalance.add(gasCost).toString() // 还要记得把gas算进去
                  )
              })

              it("withdraw ETH from a single foulder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(
                          fundMe.address // 一开始合约内有多少钱
                      )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(
                          deployer // 一开始deployer有多少钱
                      )
                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance), // 这里用add是因为数据类型将会是big number，普通的+不行
                      endingDeployerBalance.add(gasCost).toString() // 还要记得把gas算进去
                  )
              })

              it("allows us to withdraw with multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners() // 既然是多个人fund，那就定义多几个用户，每个用户都call了一遍fund函数
                  for (let i = 1; i < 6; i++) {
                      // 从第一个开始的原因是第0个是deployer，不算在accounts里面
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i] // fundMe是我们上面对合约的调用，一开始只是连接了deployer，这里需要把每个新增的用户都和合约连接上
                      )
                      await fundMeConnectedContract.fund({ value: sendValue }) // 每个用户都fund了一遍
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(
                          fundMe.address // 一开始合约内有多少钱
                      )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(
                          deployer // 一开始deployer有多少钱
                      )

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance), // 这里用add是因为数据类型将会是big number，普通的+不行
                      endingDeployerBalance.add(gasCost).toString() // 还要记得把gas算进去
                  )
                  // 再加一步，确保funders被正确地重置了
                  await expect(fundMe.s_funders(0))
                  for (i = 1; i < 6; i++) {
                      // 所有的funders的捐助都清0
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  // const accounts = await ethers.getSigners()
                  // const attacker = accounts[1]
                  // const attackerConnectedContract = await fundMe.connect(attacker)
                  // await expect(attackerConnectedContract.withdraw()).to.be.reverted
                  // 为了更加具体点，用合约里面自定义的FundMe__NotOwner错误来报出，采用下面的写法
                  const accounts = await ethers.getSigners()
                  const attackerConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
                  // 目前更加推荐下面的这种写法，因为省gas
              })
              it("cheaperWithdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners() // 既然是多个人fund，那就定义多几个用户，每个用户都call了一遍fund函数
                  for (let i = 1; i < 6; i++) {
                      // 从第一个开始的原因是第0个是deployer，不算在accounts里面
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i] // fundMe是我们上面对合约的调用，一开始只是连接了deployer，这里需要把每个新增的用户都和合约连接上
                      )
                      await fundMeConnectedContract.fund({ value: sendValue }) // 每个用户都fund了一遍
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(
                          fundMe.address // 一开始合约内有多少钱
                      )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(
                          deployer // 一开始deployer有多少钱
                      )

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance), // 这里用add是因为数据类型将会是big number，普通的+不行
                      endingDeployerBalance.add(gasCost).toString() // 还要记得把gas算进去
                  )
                  // 再加一步，确保funders被正确地重置了
                  await expect(fundMe.s_funders(0))
                  for (i = 1; i < 6; i++) {
                      // 所有的funders的捐助都清0
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
