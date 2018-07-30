import ownable from './controller/ownable';
import main from './controller/main';

const controller = artifacts.require('LotteryController.sol');
const lottery = artifacts.require('Lottery.sol');

contract('LotteryController - ownable test', function (accounts) {
  ownable(controller, accounts);
});

contract('LotteryController - main test', function (accounts) {
  main(controller, lottery, accounts);
});
