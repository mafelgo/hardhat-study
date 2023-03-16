//这个文件是hardhat项目的起点，任何关于hardhat的文件和指令都会从这个文件开始编译运行

require("@nomicfoundation/hardhat-toolbox") //导入常用工具，https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox
require("dotenv").config() //env文件
require("@nomiclabs/hardhat-etherscan") //用来在etherscan上验证solidity源代码
require("hardhat-gas-reporter") //用来显示gas的消耗
require("solidity-coverage") //检验test中是否将每个函数都测试了
require("hardhat-deploy")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "可以写其他网站"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // 默认情况下这里会是 defaultNetwork: "hardhat",也可以明写出来，不写就是默认hardhat
    networks: {
        //自定义网络
        //以后就可以输指令的时候在后面加上个 --network <yourNetworkName>
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6, //等到6个区块后被确认
        },
        //笔记：输入yarn hardhat node会出来许多个模拟节点，但是并不是在hardhat网络上的，而是本地的localhost网络上的
        //它虽然是使用了hardhat的环境，但是不是用的hardhat网络，而是localhost
        //Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
        localhost: {
            url: "http://127.0.0.1:8545/",
            //accounts: hardhat搞定了
            chainId: 31337, //虽然和hardhat一样，但就是不同的网络
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        users: {
            default: 0,
        },
    },
    solidity: "0.8.18",
    etherscan: {
        //搞这个东西是为了验证合约，要调用etherscan上面的接口
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        //这东西用来展示每个function函数啥的所花费的gas量，会列出一个表格
        //使用前记得调用require("hardhat-gas-reporter")
        enabled: true,
        outputFile: "gasReport.txt", //导出文件，这样就不会显示在终端内
        noColors: true, //不要显示颜色（在文件内
        currency: "CNY", //换算出人民币单位
        coinmarketcap: COINMARKETCAP_API_KEY, //用这个东西来获取代币换算出现实货币的价格，https://pro.coinmarketcap.com/account/
        token: "ETH", //可以换成其它代币进行换算（默认ETH），https://www.npmjs.com/package/hardhat-gas-reporter
    },
}
