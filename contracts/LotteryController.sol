pragma solidity ^0.4.24;

import './ownership/PercentRateProvider.sol';
import './ownership/Ownable.sol';
import './math/SafeMath.sol';

contract LotteryController is OWnable, PercentRateProvider {

  using SafeMath for uint;

  address[] public lotteries;

  address[] public finishedLotteries;

  address public feeWallet;

  address public feePercent;

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function setFeePercent(address newFeePercent) public onlyOwner {
    feePercent = newFeePercent;
  }

  function newLottery(uint period) public onlyOwner return(address) {
    return newFutureLottery(now, period);
  } 

  function newFutureLottery(uint start, uint period) public onlyOwner return(address) {
    return newCustomFutureLottery(now, period, feeWallet, feePercent);
  } 

  function newCustomFutureLottery(uint start, uint period, address cFeeWallet, uint cFeePercent) public onlyOwner returns(address) {
    require(start + period > now) && feePercent < PERCENT_RATE);
    Lottery lottery = new Lottery();
    lottery.setStart(start);
    lottery.setPeriod(period);
    lottery.setFeeWallet(cFeeWallet);
    lottery.setFeePercent(cFeePercent);
    lotetry.lock();
    lotteries.push(lottery);
  }

  function finishLottery(address lotAddr) public onlyOwner {
    // TODO:
  }

}

