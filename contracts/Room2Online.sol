pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';
import './token/ERC20Cutted.sol';

contract Room2Online is Ownable {

  event TicketPurchased(address lotAddr, uint ticketNumber, address player, uint ticketPrice);

  event TicketPayed(address lotAddr, uint lotIndex, uint ticketNumber, address player, uint win);

  event LotFinished(address lotAddr, uint lotIndex);

  event ParametersUpdated(address feeWallet, uint feePercent, uint minInvestLimit);

  using SafeMath for uint;

  uint public LIMIT = 100;

  uint public PERCENT_RATE = 100;

  uint public minInvestLimit;

  uint public feePercent;

  address public feeWallet;

  mapping (address => uint) public summaryPayed;

  struct Ticket {
    address owner;
    uint purchased;
    uint win;
    bool finished;
  }

  struct Lot {
    uint balance;
    uint[] ticketNumbers;
    uint finishedTime;
  }

  Ticket[] public tickets;

  uint public lotIndex;

  mapping(uint => Lot) public lots;

  modifier notContract(address to) {
    uint codeLength;
    assembly {
      codeLength := extcodesize(to)
    }
    require(codeLength == 0, "Contracts not supported!");
    _;
  }

  function updateParameters(address newFeeWallet, uint newFeePercent, uint newMinInvestLimit) public onlyOwner {
    feeWallet = newFeeWallet;
    feePercent = newFeePercent;
    minInvestLimit = newMinInvestLimit;
    emit ParametersUpdated(newFeeWallet, newFeePercent, newMinInvestLimit);
  }

  function getTicketInfo(uint ticketNumber) view public returns(address, uint, uint, bool) {
    Ticket storage ticket = tickets[ticketNumber];
    return (ticket.owner, ticket.purchased, ticket.win, ticket.finished);
  }

  constructor() public {
    minInvestLimit = 100000000000000000;
    feePercent = 30;
    feeWallet = 0x53F22b8f420317E7CDcbf2A180A12534286CB578;
    emit ParametersUpdated(feeWallet, feePercent, minInvestLimit);
  }

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function () public payable notContract(msg.sender) {
    require(msg.value >= minInvestLimit);
    tickets.push(Ticket(msg.sender, msg.value, 0, false));    
    emit TicketPurchased(address(this), tickets.length.sub(1), msg.sender, msg.value);
    uint fee = msg.value.mul(feePercent).div(PERCENT_RATE);
    feeWallet.transfer(fee);
  }

  function processRewards(uint[] ticketNumbers, uint[] wins) public onlyOwner {
    Lot storage lot = lots[lotIndex];
    for(uint i = 0; i<ticketNumbers.length; i++) {
      uint ticketNumber = ticketNumbers[i];
      Ticket storage ticket = tickets[ticketNumber];
      if(!ticket.finished) {
        ticket.win = wins[i];
        ticket.finished = true;
        lot.ticketNumbers.push(ticketNumber);
        lot.balance.add(wins[i]);
        ticket.owner.transfer(wins[i]);
        emit TicketPayed(address(this), lotIndex, ticketNumber, ticket.owner, wins[i]);
      }
    }
  }

  function finishLot(uint lotFinishedTime) public onlyOwner {
    Lot storage lot = lots[lotIndex];
    lot.finishedTime = lotFinishedTime;
    emit LotFinished(address(this), lotIndex);
    lotIndex++;
  }

  function retrieveTokens(address tokenAddr, address to) public onlyOwner {
    ERC20Cutted token = ERC20Cutted(tokenAddr);
    token.transfer(to, token.balanceOf(address(this)));
  }

}

