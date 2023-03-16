// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
//上面这个玩意是一个接口，用来接入关于代币价格Oracle
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    address[] public s_funders;
    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public immutable i_owner;
    mapping(address => uint256) public s_addressToAmountFunded;
    AggregatorV3Interface public s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
        //上面出现的下划线是指，modifier执行其它语句的优先级，上述所示的是先执行if，再执行调用的函数
    }

    function withdraw() public onlyOwner {
        //这一步就是将所有捐助者的累计资金清0，因为要提取出来了
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); //这一步就是重置整个funders数组，变成全新的address数组，并且0个对象
        // // transfer
        // payable(msg.sender).transfer(address(this).balance); transfer会在交易失败的时候自动回滚
        // 将msg.sender转化为payable类型，this代表的是整个合约的地址
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance); 而send想要回滚交易就必须要加require
        // require(sendSuccess, "Send failed");
        // // call
        (bool callSuccess /*bytes memory dataReturned*/, ) = payable(msg.sender)
            .call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
        // call右边的括号内可以填某个合约内的某个函数的信息，但是这里并没有去调用哪个合约，所以留空
        // /*bytes memory dataReturned*/就是在如果call了函数的情况下需要那个函数返回的数据
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
