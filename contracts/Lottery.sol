pragma solidity ^0.4.24;

import './Lockabale.sol';
import './PercentRateProvider.sol';
import './math/SafeMath.sol';

contract Lottery is Lockabale, PercentRateProvier {

  using SafeMath for uint;

  uint public start;

  uint public period;

  uint public feePercent;
 
  address public feeWallet;

  mapping(address => uint) public invested;

  address[] investors;

  modifier investFininshed() {
    require(start + period * 1 days > now);
    _;
  }

  modifier investTime() {
    require(start + period * 1 days < now && start >= now);
    _;
  }

  function setFeeWallet(uint newFeeWallet) public onlyOwner notLocked {
    feeWallet = newFeeWallet;
  }

  function setStart(uint newStart) public onlyOwner notLocked {
    start = newStart;
  }

  function setPerido(uint newPeriod) public onlyOwner notLocked {
    period = newPeriod;
  }

  function setFeePercent(uint newFeePercent) public onlyOwner notLocked {
    require(newFeePercent < PERCENT_RATE);
    feePercent = newFeePercent;
  }

  function () public payable locked investTime {
    uint invest = invested[msg.sender];
    if(invest == 0) {
      investors.push(msg.sender);
    }
    invested[msg.sender] = invest.add(msg.value);
  }

  function finish() public onlyOwner locked investFininshed {
    wallet.transfer(this.balance.mul(PERCENT_RATE).div(feePercent));
    // TODO
  }

}

