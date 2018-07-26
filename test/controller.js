import ownable from './controller/ownable';

const controller = artifacts.require('LotteryController.sol');

contract('LotteryController - ownable test', function (accounts) {
  ownable(controller, accounts);
});
