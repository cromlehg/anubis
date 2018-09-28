pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';
import './Lottery.sol';

contract LotteryController is Ownable {

  using SafeMath for uint;

  uint public PERCENT_RATE = 100;

  address[] public lotteries;

  address[] public finishedLotteries;

  address public feeWallet = address(this);

  uint public feePercent = 5;

  event LotteryCreated(address newAddress);

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function setFeePercent(uint newFeePercent) public onlyOwner {
    feePercent = newFeePercent;
  }

  function newLottery(uint period, uint ticketPrice) public onlyOwner returns(address) {
    return newFutureLottery(now, period, ticketPrice);
  } 

  function newFutureLottery(uint start, uint period, uint ticketPrice) public onlyOwner returns(address) {
    return newCustomFutureLottery(start, ticketPrice, period, feeWallet, feePercent);
  } 

  function newCustomFutureLottery(uint start, uint period, uint ticketPrice, address cFeeWallet, uint cFeePercent) public onlyOwner returns(address) {
    require(start + period > now && feePercent < PERCENT_RATE);
    Lottery lottery = new Lottery();
    emit LotteryCreated(lottery);
    lottery.setStart(start);
    lottery.setPeriod(period);
    lottery.setFeeWallet(cFeeWallet);
    lottery.setFeePercent(cFeePercent);
    lottery.setTicketPrice(ticketPrice);
    lottery.startLottery();
    lotteries.push(lottery);
  }

  function processFinishLottery(address lotAddr) public onlyOwner returns(bool) {
    Lottery lot = Lottery(lotAddr);
    if(lot.state() == Lottery.LotteryState.Accepting ||
         lot.state() == Lottery.LotteryState.Processing) {
      lot.prepareToRewardProcess();
    } else if(lot.state() == Lottery.LotteryState.Rewarding) {
      lot.processReward(); 
      if(lot.state() == Lottery.LotteryState.Finished) {
        finishedLotteries.push(lotAddr);
        return true;
      }
    } else {
      revert();
    }
    return false;
  }

  function retrieveEth() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

}

