pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';
import './Lottery.sol';

contract LotteryController is Ownable {

  using SafeMath for uint;

  uint public PERCENT_RATE = 100;

  address[] public lotteries;

  address[] public finishedLotteries;

  address public feeWallet;

  uint public feePercent;

  event LotteryCreated(address newAddress);

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function setFeePercent(uint newFeePercent) public onlyOwner {
    feePercent = newFeePercent;
  }

  function newLottery(uint period) public onlyOwner returns(address) {
    return newFutureLottery(now, period);
  } 

  function newFutureLottery(uint start, uint period) public onlyOwner returns(address) {
    return newCustomFutureLottery(start, period, feeWallet, feePercent);
  } 

  function newCustomFutureLottery(uint start, uint period, address cFeeWallet, uint cFeePercent) public onlyOwner returns(address) {
    require(start + period > now && feePercent < PERCENT_RATE);
    Lottery lottery = new Lottery();
    LotteryCreated(lottery);
    lottery.setStart(start);
    lottery.setPeriod(period);
    lottery.setFeeWallet(cFeeWallet);
    lottery.setFeePercent(cFeePercent);
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

}

