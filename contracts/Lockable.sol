pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

contract Lockabale is Ownable {

  bool public locked;

  modifier notLocked() {
    require(!locked);
    _;
  }

  modifier locked() {
    require(locked);
    _;
  }

  function lock() public onlyOnwer {
    locked = true;
  }

}

