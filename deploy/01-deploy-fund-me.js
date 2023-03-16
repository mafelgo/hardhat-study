//传统模式下首先require或import，然后main function，最后calling of main function

const { network, ethers } = require("hardhat")
const {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// async function deployFunc(hre) {
//   console.log("HI");
// }
// module.exports.default = deployFunc;
// 上面的写法就是deploy的大致框架，与下面的写法是一致的，区别在于下面的没有命名

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
//   // hre.getNamedAccounts
//   // hre.deployments
//   其实就如同 const { ethers } = require("hardhat"); 这句话一样
//   从hardhat包里面取出ethers工具这样类似的操作
//   这里就相当于从hre中取出 getNamedAccounts, deployments 这两个工具
// };

// 上面的写法又等同于下面的写法
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If chainId is X, use address Y. Or if chainId is Z, use A.

    // const ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"];

    // 问题抛出：每次部署时都需要连接测试网络，获取各种数据，看上去又慢又没有即时代码反馈？
    // 如果部署到hardhat，则每次关闭终端就会被销毁
    // 即使部署到本地localhost，也是需要获取price feed，且也存在着其它不足于直接连接测试网的地方
    // 此时便需要一个工具——mock，用来模拟被测试对象的行为，替代其所需要的操作

    // 因此，每当建立hardhat网或者localhost网，便需要想到mock这个工具

    // if (chainId == 31337) {
    //   // 如果是本地的网络，则启用mocks
    //   log(developmentChains);
    //   // const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    //   // ethUsdPriceFeedAddress - ethUsdAggregator.address;
    //   await deploy("MockV3Aggregator", {
    //     contract: "MockV3Aggregator",
    //     from: deployer, // 一开始这里报错，后来去hardhat-config那里default为0就过了
    //     log: true,
    //     args: [DECIMALS, INITIAL_ANSWER], // 这里要去看看有没有构造器初始化，传参进去初始化。node_modules/@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol
    //   });
    // } else {
    //   // 如果不是本地的网络，而是在线测试网，就用下面的
    //   const ethUsdPriceFeedAddress = [networkConfig[chainId]["ethUsdPriceFeed"]];
    //   const fundMe = await deploy("FundMe", {
    //     from: deployer,
    //     args: ethUsdPriceFeedAddress, //这里放关于priceFeed的地址
    //     log: true,
    //     waitConfirmations: network.config.blockConfirmations || 1, //这个或1的意思是如果左边未定义就只等1个区块
    //   });

    //   // verify功能，和上一节学习内容一致，只不过现在在hardhat deploy中进行实现
    //   if (process.env.ETHERSCAN_API_KEY) {
    //     // verify文件放在了utils文件夹中
    //     await verify(fundMe.address, ethUsdPriceFeedAddress);
    //   }
    // }

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("---------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
