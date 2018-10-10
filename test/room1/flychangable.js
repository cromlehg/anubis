import ether from '../helpers/ether';
import EVMRevert from '../helpers/EVMRevert';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import {advanceBlock} from '../helpers/advanceToBlock';

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

export default function (Room, wallets) {
  let room;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.percentRate = 100;
    this.feePercent = 5;
    this.ticketPrice = ether(0.1);

    room = await Room.new();
    await room.setFeeWallet(wallets[1]);

  });

  it ('should not update parameters if current lottery is going', async function () {
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(700));

    const newFeePercent = 10;
    const newStarts = latestTime() + duration.seconds(10);
    const newDuration = 90000;
    const newInterval = 500;
    const newTicketPrice = ether(0.2);

    var state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const owner = await room.owner();
    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.rejectedWith(EVMRevert);

  });

  it ('should set new parameters: feeWallet, starts, duration, interval', async function () {
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime);

    const newFeePercent = 10;
    const newStarts = latestTime() + duration.seconds(10);
    const newDuration = 90000;
    const newInterval = 500;
    const newTicketPrice = ether(0.2);

    var state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const owner = await room.owner();
    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.fulfilled;

    const feeWallet = await room.feeWallet();
    feeWallet.should.be.equal(wallets[2]);

    const starts = await room.starts();
    starts.should.be.bignumber.equal(newStarts);

    const lotDuration = await room.duration();
    lotDuration.should.be.bignumber.equal(newDuration);

    const interval = await room.interval();
    interval.should.be.bignumber.equal(newInterval);

  });

  it ('should update parameters and use it', async function () {
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(10));

    const newFeePercent = 10;
    const newStarts = latestTime() + duration.days(1);
    const newDuration = 90000;
    const newInterval = 500;
    const newTicketPrice = ether(0.5);

    var state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const owner = await room.owner();
    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.fulfilled;

    const balancePre = web3.eth.getBalance(wallets[2]);

    // new start time is later
    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.rejectedWith(EVMRevert);
    await increaseTimeTo(newStarts);

    // new ticket price is bigger
    await room.sendTransaction({value: this.ticketPrice, from: wallets[3]}).should.be.rejectedWith(EVMRevert);  
    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: ether(1), from: wallets[4]}).should.be.fulfilled;
    const summaryInvestment = ether(1.5);

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime);

    state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const balancePost = web3.eth.getBalance(wallets[2]);
    const fee = summaryInvestment.mul(newFeePercent).div(this.percentRate);
    balancePost.sub(balancePre).should.be.bignumber.equal(fee);

  });

}
