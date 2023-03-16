const networkConfig = {
  11155111: {
    name: "repolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", //https://docs.chain.link/data-feeds/price-feeds/addresses
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
}; //就是说如果这个js要被引用的话，以networkConfig的名称或其它所引用
