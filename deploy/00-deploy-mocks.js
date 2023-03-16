//这个文件是单独用来整mocks的，接下来准备部署一个有自定义priceFeed的合约
//之前说过，mocks就是用来模拟一个被测试对象的工具，这里用来模拟一个合约
//也就是说等下还得创建一个合约，/..contracts/test/MockV3Aggregator.sol

const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        //network.name包含了hardhat和localhost
        // log("检测到本地网络，准备部署mocks。。");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer, // 一开始这里报错，后来去hardhat-config那里default为0就过了
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // 这里要去看看有没有构造器初始化，传参进去初始化。node_modules/@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol
        })
        // log("mocks部署完成！");
        log("=============================================================")
    }
}

module.exports.tags = ["all", "mocks"]
// 这个tags意思就是以后在执行终端命令的时候加入这个关键词，就可以只执行指定的文件
// 比如输入 yarn hardhat deploy --tags mocks
// 因为这个文件里面的关键词就是mocks，那就会执行这个00-deploy-mocks.js文件
