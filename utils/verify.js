const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("正在验证中。。。");
  try {
    //这里的run就是可以让我们执行hardhat内的任务指令
    //这里第一个verify是表示我们要在etherscan上验证合约（输入yarn hardhat就可以看到有这个指令）
    //这里的第二个verify就是具体要做的指令（刚好也叫verify）
    //要注意这后面的指令必须要很详细，所以可以输入yarn hardhat verify --help来查询有哪些具体指令可以输进去
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    }); //这里有个坑，VPN要开启增强模式才能连得了，不然会出现超时报错！！！
    //Clash for windows里面这个增强模式是TUN Mode
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("已经验证过了");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
