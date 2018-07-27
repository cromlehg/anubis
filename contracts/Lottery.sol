pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';

contract Lottery is Ownable {

  using SafeMath for uint;

  uint public LIMIT = 100;

  uint public RANGE = 1000000000;

  uint public MIN_INVEST_LIMIT = 100000000000000000;

  uint public PERCENT_RATE = 1000;

  uint public index;

  uint public start;

  uint public period;

  uint public feePercent;

  uint public summaryNumbers;
 
  address public feeWallet;

  mapping(address => uint) public invested;

  address[] investors;

  mapping(address => uint) public numbers;

  mapping(address => uint) public winBalances;

  enum LotteryState { Init, Accepting, Processing, Rewarding, Finished }

  LotteryState public state;

  modifier investPeriodFininshed() {
    require(start + period * 1 days < now);
    _;
  }

  modifier initState() {
    require(state == LotteryState.Init);
    _;
  }

  modifier acceptingState() {
    require(state == LotteryState.Accepting);
    _;
  }

  modifier investTime() {
    require(now >= start && now <= start + period * 1 days);
    _;
  }

  function setFeeWallet(address newFeeWallet) public onlyOwner initState {
    feeWallet = newFeeWallet;
  }

  function setStart(uint newStart) public onlyOwner initState {
    start = newStart;
  }

  function setPeriod(uint newPeriod) public onlyOwner initState {
    period = newPeriod;
  }

  function setFeePercent(uint newFeePercent) public onlyOwner initState {
    require(newFeePercent < PERCENT_RATE);
    feePercent = newFeePercent;
  }

  function startLottery() public onlyOwner {
    require(state == LotteryState.Init);
    state = LotteryState.Accepting;
  }

  function () public payable investTime acceptingState {
    require(msg.value >= MIN_INVEST_LIMIT);
    require(RANGE.mul(RANGE) > investors.length);
    require(RANGE.mul(RANGE).mul(address(this).balance.add(msg.value)) > 0);
    uint invest = invested[msg.sender];
    if(invest == 0) {
      investors.push(msg.sender);
    }
    invested[msg.sender] = invest.add(msg.value);
  }

  function prepareToRewardProcess() public investPeriodFininshed onlyOwner {
    if(state == LotteryState.Accepting) {
      state = LotteryState.Processing;
    } 

    require(state == LotteryState.Processing);

    uint limit = investors.length - index;
    if(limit > LIMIT) {
      limit = LIMIT;
    }

    uint number = block.number;

    limit += index;

    for(; index < limit; index++) {
      number = uint(keccak256(abi.encodePacked(number)))%RANGE;
      numbers[investors[index]] = number;
      summaryNumbers = summaryNumbers.add(number);
    }

    if(index == investors.length) {
      feeWallet.transfer(address(this).balance.mul(feePercent).div(PERCENT_RATE));
      state = LotteryState.Rewarding;
      index = 0;
    }

  }

  function processReward() public onlyOwner {    
    require(state == LotteryState.Rewarding);

    uint limit = investors.length - index;
    if(limit > LIMIT) {
      limit = LIMIT;
    }

    limit += index;

    for(; index < limit; index++) {
      address investor = investors[index];
      uint number = numbers[investor];
      if(number > 0) {
        winBalances[investor] = address(this).balance.mul(number).div(summaryNumbers);
      }
    }

    if(index == investors.length) {
      state = LotteryState.Finished;
    }
   
  }

  function reward() public {
    require(state == LotteryState.Finished);
    uint winBalance = winBalances[msg.sender];
    winBalances[msg.sender] = 0;
    msg.sender.transfer(winBalance);
  }

}

