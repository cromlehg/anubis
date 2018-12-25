pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";
import "./math/SafeMath.sol";
import "./token/ERC20Cutted.sol";


contract Room2Online is Ownable {

  event TicketPurchased(address lotAddr, uint ticketNumber, address player, uint totalAmount, uint netAmount);

  event TicketPaid(address lotAddr, uint lotIndex, uint ticketNumber, address player, uint winning);

  event LotStarted(address lotAddr, uint lotIndex, uint startTime);

  event LotFinished(address lotAddr, uint lotIndex, uint finishTime);

  event ParametersUpdated(address feeWallet, uint feePercent, uint minInvestLimit);

  using SafeMath for uint;

  uint public percentRate = 100;

  uint public minInvestLimit;

  uint public feePercent;

  address public feeWallet;

  struct Ticket {
    address owner;
    uint totalAmount;
    uint netAmount;
    uint winning;
    bool finished;
  }

  struct Lot {
    uint balance;
    uint[] ticketNumbers;
    uint startTime;
    uint finishTime;
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

  function getTicketInfo(uint ticketNumber) public view returns(address, uint, uint, uint, bool) {
    Ticket storage ticket = tickets[ticketNumber];
    return (ticket.owner, ticket.totalAmount, ticket.netAmount, ticket.winning, ticket.finished);
  }

  constructor () public {
    minInvestLimit = 100000000000000000;
    feePercent = 30;
    feeWallet = 0x53F22b8f420317E7CDcbf2A180A12534286CB578;
    emit ParametersUpdated(feeWallet, feePercent, minInvestLimit);
    emit LotStarted(address(this), lotIndex, now);
  }

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function () public payable notContract(msg.sender) {
    require(msg.value >= minInvestLimit);
    uint fee = msg.value.mul(feePercent).div(percentRate);
    uint netAmount = msg.value.sub(fee);
    tickets.push(Ticket(msg.sender, msg.value, netAmount, 0, false));
    emit TicketPurchased(address(this), tickets.length.sub(1), msg.sender, msg.value, netAmount);
    feeWallet.transfer(fee);
  }

  function processRewards(uint[] ticketNumbers, uint[] winnings) public onlyOwner {
    Lot storage lot = lots[lotIndex];
    for (uint i = 0; i < ticketNumbers.length; i++) {
      uint ticketNumber = ticketNumbers[i];
      Ticket storage ticket = tickets[ticketNumber];
      if (!ticket.finished) {
        ticket.winning = winnings[i];
        ticket.finished = true;
        lot.ticketNumbers.push(ticketNumber);
        lot.balance = lot.balance.add(winnings[i]);
        ticket.owner.transfer(winnings[i]);
        emit TicketPaid(address(this), lotIndex, ticketNumber, ticket.owner, winnings[i]);
      }
    }
  }

  function finishLot(uint currentLotFinishTime, uint nextLotStartTime) public onlyOwner {
    Lot storage currentLot = lots[lotIndex];
    currentLot.finishTime = currentLotFinishTime;
    emit LotFinished(address(this), lotIndex, currentLotFinishTime);
    lotIndex++;
    Lot storage nextLot = lots[lotIndex];
    nextLot.startTime = nextLotStartTime;
    emit LotStarted(address(this), lotIndex, nextLotStartTime);
  }

  function retrieveTokens(address tokenAddr, address to) public onlyOwner {
    ERC20Cutted token = ERC20Cutted(tokenAddr);
    token.transfer(to, token.balanceOf(address(this)));
  }

}

