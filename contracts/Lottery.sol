pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';

contract Lottery is Ownable {

  using SafeMath for uint;

  uint public LIMIT = 100;

  uint public RANGE = 1000000000;

  uint public ticketPrice = 100000000000000000;

  uint public PERCENT_RATE = 100;

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

  mapping(address => uint) public toPayBalances;

  enum LotteryState { Init, Accepting, Processing, Rewarding, Finished }

  LotteryState public state;

  modifier notContract(address to) {
    uint codeLength;
    assembly {
      // Retrieve the size of the code on target address, this needs assembly .
      codeLength := extcodesize(to)
    }
    require(codeLength == 0, "Contracts can not participate!");
    _;
  }

  modifier investPeriodFininshed() {
    require(start + period < now, "Lottery invest period finished!");
    _;
  }

  modifier initState() {
    require(state == LotteryState.Init, "Lottery should be on Init state!");
    _;
  }

  modifier acceptingState() {
    require(state == LotteryState.Accepting, "Lottery should be on Accepting state!");
    _;
  }

  modifier investTime() {
    require(now >= start && now <= start + period, "Wrong time to invest!");
    _;
  }

  function setTicketPrice(uint newTicketPrice) public onlyOwner initState {
    ticketPrice = newTicketPrice;
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

  function () public payable investTime acceptingState notContract(msg.sender) {
    require(msg.value < ticketPrice, "Not enough funds to buy ticket!");
    require(RANGE.mul(RANGE) > investors.length, "Player number error!");
    require(RANGE.mul(RANGE).mul(address(this).balance.add(msg.value)) > 0, "Limit error!");
    uint invest = invested[msg.sender];
    require(invest == 0, "Already invested!");
    //if(invest == 0) {
    investors.push(msg.sender);
    //}
    invested[msg.sender] = invest.add(msg.value);
    uint diff = msg.value - ticketPrice;
    if(diff > 0) {
      msg.sender.transfer(diff);
    }
  }

  function prepareToRewardProcess() public investPeriodFininshed onlyOwner {
    if(state == LotteryState.Accepting) {
      state = LotteryState.Processing;
    } 

    require(state == LotteryState.Processing, "Lottery state should be Processing!");

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
    require(state == LotteryState.Rewarding, "Lottery state should be Rewarding!");

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
        investor.transfer(winBalances[investor]);
      }
    }

    if(index == investors.length) {
      state = LotteryState.Finished;
    }
   
  }

}

