import ownable from './lottery/ownable';
import init from './lottery/init';
import main from './lottery/main';

const lottery = artifacts.require('Lottery.sol');

contract('Lottery - ownable test', function (accounts) {
  ownable(lottery, accounts);
});

contract('Lottery - init test', function (accounts) {
  init(lottery, accounts);
});

contract('Lottery - main test', function (accounts) {
  main(lottery, accounts);
});
