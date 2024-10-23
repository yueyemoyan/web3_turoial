// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {

    mapping(address => uint256) public fundersToAmount;

    AggregatorV3Interface public dataFeed;

    uint256 constant MINIMUM_VALUE = 100 * 10 ** 18; //USD

    uint256 constant TARGET = 1000 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;

    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    event FundWithdrawByOwner(uint256);

    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }

     modifier windowClosed() {
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed");
        _;
    }
    
    constructor(uint256 _lockTime, address dataFeedAddr){
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function  transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner{
        require(convertEthToUsd(address(this).balance) >= TARGET, "Target is not reached");
        // transfer: transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);
        
        // send: transfer ETH and return false if failed
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed");
        
        // call: transfer ETH with data return value of function and bool 
        bool success;
        uint256 balance = address(this).balance;
        (success,) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
        emit FundWithdrawByOwner(balance);
    }

    function reFund() external windowClosed {
        uint256 amount = fundersToAmount[msg.sender];
        require(convertEthToUsd(address(this).balance) < TARGET,  "Target is reached");
        require(amount != 0, "there is no fund to you");
        bool success;
        (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "you do not have permission to call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }
}