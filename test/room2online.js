import ownable from './room2online/ownable';
import main from './room2online/main';

const room = artifacts.require('Room2Online.sol');

contract('Room2Online - ownable test', function (accounts) {
  ownable(room, accounts);
});

contract('Room2Online - main test', function (accounts) {
  main(room, accounts);
});
