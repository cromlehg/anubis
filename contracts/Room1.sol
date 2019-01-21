pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './math/SafeMath.sol';
import './token/ERC20Cutted.sol';

contract Room1 is Ownable {

  event TicketPurchased(address lotAddr, uint lotIndex, uint ticketNumber, address player, uint ticketPrice);

  event TicketWon(address lotAddr, uint lotIndex, uint ticketNumber, address player, uint win);

  event ParametersUpdated(uint lotIndex, address feeWallet, uint feePercent, uint starts, uint duration, uint interval, uint ticketPrice);

  using SafeMath for uint;

  uint diffRangeCounter = 0;

  uint public LIMIT = 100;

  uint public RANGE = 1000000000;

  uint public PERCENT_RATE = 100;

  enum LotState { Accepting, Processing, Rewarding, Finished }

  uint public interval;

  uint public duration;

  uint public starts;

  uint public ticketPrice;

  uint public feePercent;

  uint public lotProcessIndex;

  uint public lastChangesIndex;

  uint public MIN_DISPERSION_K = 10;

  address public feeWallet;

  mapping (address => uint) public summaryPayed;

  struct Ticket {
    address owner;
    uint number;
    uint win;
  }

  struct Lot {
    LotState state;
    uint processIndex;
    uint summaryNumbers;
    uint summaryInvested;
    uint rewardBase;
    uint ticketsCount;
    uint playersCount;
    mapping (uint => Ticket) tickets;
    mapping (address => uint) invested;
    address[] players;
  }

  mapping(uint => Lot) public lots;

  modifier started() {
    require(now >= starts, "Not started yet!");
    _;
  }

  modifier notContract(address to) {
    uint codeLength;
    assembly {
      codeLength := extcodesize(to)
    }
    require(codeLength == 0, "Contracts not supported!");
    _;
  }

  function updateParameters(address newFeeWallet, uint newFeePercent, uint newStarts, uint newDuration, uint newInterval, uint newTicketPrice) public onlyOwner {
    require(newStarts > now, "Lottery can only be started in the future!");
    uint curLotIndex = getCurLotIndex();
    Lot storage lot = lots[curLotIndex];
    require(lot.state == LotState.Finished, "Contract parameters can only be changed if the current lottery is finished!");
    lastChangesIndex = curLotIndex.add(1);
    feeWallet = newFeeWallet;
    feePercent = newFeePercent;
    starts = newStarts;
    duration = newDuration;
    interval = newInterval;
    ticketPrice = newTicketPrice;
    emit ParametersUpdated(lastChangesIndex, newFeeWallet, newFeePercent, newStarts, newDuration, newInterval, newTicketPrice);
  }

  function getLotInvested(uint lotNumber, address player) view public returns(uint) {
    Lot storage lot = lots[lotNumber];
    return lot.invested[player];
  }

  function getTicketInfo(uint lotNumber, uint ticketNumber) view public returns(address, uint, uint) {
    Ticket storage ticket = lots[lotNumber].tickets[ticketNumber];
    return (ticket.owner, ticket.number, ticket.win);
  }

  function getCurLotIndex() view public returns(uint) {
    if (starts > now) {
      return lastChangesIndex;
    }
    uint passed = now.sub(starts);
    if(passed == 0)
      return 0;
    return passed.div(interval.add(duration)).add(lastChangesIndex);
  }

  constructor() public {
    starts = 1548093600; //1542999600;
    ticketPrice = 1000000000000000000; //100000000000000000;
    feePercent = 30;
    feeWallet = 0x53F22b8f420317E7CDcbf2A180A12534286CB578;
    interval = 3600;
    uint fullDuration = 7200;
    duration = fullDuration.sub(interval);
    emit ParametersUpdated(0, feeWallet, feePercent, starts, duration, interval, ticketPrice);
  }

  function setFeeWallet(address newFeeWallet) public onlyOwner {
    feeWallet = newFeeWallet;
  }

  function getNotPayableTime(uint lotIndex) view public returns(uint) {
    return starts.add(interval.add(duration).mul(lotIndex.add(1).sub(lastChangesIndex))).sub(interval);
  }

  function () public payable notContract(msg.sender) started {
    require(RANGE.mul(RANGE).mul(address(this).balance.add(msg.value)) > 0, "Balance limit error!");
    require(msg.value >= ticketPrice, "Not enough funds to buy ticket!");
    uint curLotIndex = getCurLotIndex();
    require(now < getNotPayableTime(curLotIndex), "Game finished!");
    Lot storage lot = lots[curLotIndex];
    require(RANGE.mul(RANGE) > lot.ticketsCount, "Ticket count limit exceeded!");

    uint numTicketsToBuy = msg.value.div(ticketPrice);

    uint toInvest = ticketPrice.mul(numTicketsToBuy);

    if(lot.invested[msg.sender] == 0) {
      lot.players.push(msg.sender);
      lot.playersCount = lot.playersCount.add(1);
    }

    lot.invested[msg.sender] = lot.invested[msg.sender].add(toInvest);

    for(uint i = 0; i < numTicketsToBuy; i++) {
      lot.tickets[lot.ticketsCount].owner = msg.sender;
      emit TicketPurchased(address(this), curLotIndex, lot.ticketsCount, msg.sender, ticketPrice);
      lot.ticketsCount = lot.ticketsCount.add(1);
    }

    lot.summaryInvested = lot.summaryInvested.add(toInvest);

    uint refund = msg.value.sub(toInvest);
    msg.sender.transfer(refund);
  }

  function canUpdate() view public returns(bool) {
    if (starts > now) {
      return false;
    }
    uint curLotIndex = getCurLotIndex();
    Lot storage lot = lots[curLotIndex];
    return lot.state == LotState.Finished;
  }

  function isProcessNeeds() view public returns(bool) {
    if (starts > now) {
      return false;
    }
    uint curLotIndex = getCurLotIndex();
    Lot storage lot = lots[curLotIndex];
    return lotProcessIndex < curLotIndex || (now >= getNotPayableTime(lotProcessIndex) && lot.state != LotState.Finished);
  }

  function prepareToRewardProcess() public onlyOwner started {
    Lot storage lot = lots[lotProcessIndex];

    if(lot.state == LotState.Accepting) {
      require(now >= getNotPayableTime(lotProcessIndex), "Lottery stakes accepting time not finished!");
      lot.state = LotState.Processing;
    }

    require(lot.state == LotState.Processing || lot.state == LotState.Rewarding, "State should be Processing or Rewarding!");

    uint index = lot.processIndex;

    uint limit = lot.ticketsCount - index;
    if(limit > LIMIT) {
      limit = LIMIT;
    }

    limit = limit.add(index);

    uint number;

    if(lot.state == LotState.Processing) {

      number = block.number;

      uint dispersionK = MIN_DISPERSION_K;

      uint diffRangeLimit = 0;
 
      if(limit > 0) {
        diffRangeLimit = limit.div(dispersionK);
        if(diffRangeLimit == 0) {
          diffRangeLimit = 1;
        }
      }

      diffRangeCounter = 0;

      uint enlargedRange = RANGE.mul(dispersionK);

      bool enlargedWinnerGenerated = false;

      bool enlargedWinnerPrepared = false;

      uint enlargedWinnerIndex = 0;

      for(; index < limit; index++) {

        number = uint(keccak256(abi.encodePacked(number)))%RANGE;
        lot.tickets[index].number = number;
        lot.summaryNumbers = lot.summaryNumbers.add(number);

        if(!enlargedWinnerGenerated) {
          enlargedWinnerIndex = uint(keccak256(abi.encodePacked(number)))%enlargedRange;
          enlargedWinnerGenerated = true;
        } if(!enlargedWinnerPrepared && diffRangeCounter == enlargedWinnerIndex) {
          number = uint(keccak256(abi.encodePacked(number)))%enlargedRange;
          lot.tickets[index].number = lot.tickets[index].number.add(number);
          lot.summaryNumbers = lot.summaryNumbers.add(number);
          enlargedWinnerGenerated = true;
        }

        if(diffRangeCounter == diffRangeLimit) {
          diffRangeCounter = 0;
          enlargedWinnerPrepared = false;
          enlargedWinnerGenerated = false;
        }

        diffRangeCounter++;
      }

      if(index == lot.ticketsCount) {
        uint fee = lot.summaryInvested.mul(feePercent).div(PERCENT_RATE);
        feeWallet.transfer(fee);
        lot.rewardBase = lot.summaryInvested.sub(fee);
        lot.state = LotState.Rewarding;
        index = 0;
      }

    } else {

      for(; index < limit; index++) {
        Ticket storage ticket = lot.tickets[index];
        number = ticket.number;
        if(number > 0) {
          ticket.win = lot.rewardBase.mul(number).div(lot.summaryNumbers);
          if(ticket.win > 0) {
            ticket.owner.transfer(ticket.win);
            summaryPayed[ticket.owner] = summaryPayed[ticket.owner].add(ticket.win);
            emit TicketWon(address(this), lotProcessIndex, index, ticket.owner, ticket.win);
          }
        }
      }

      if(index == lot.ticketsCount) {
        lot.state = LotState.Finished;
        lotProcessIndex = lotProcessIndex.add(1);
      }
    }

    lot.processIndex = index;
  }

  function retrieveTokens(address tokenAddr, address to) public onlyOwner {
    ERC20Cutted token = ERC20Cutted(tokenAddr);
    token.transfer(to, token.balanceOf(address(this)));
  }

}

