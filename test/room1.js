import ownable from './room1/ownable';
import main from './room1/main';
import bigData from './room1/big_data';
import flychangable from './room1/flychangable';

const room = artifacts.require('Room1.sol');

contract('Room1 - big data test', function (accounts) {
  bigData(room, accounts);
});

/*
contract('Room1 - ownable test', function (accounts) {
  ownable(room, accounts);
});

contract('Room1 - main test', function (accounts) {
  main(room, accounts);
});

contract('Room1 - flychangable test', function (accounts) {
  flychangable(room, accounts);
});
*/
