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
    await increaseTimeTo(lotFinishTime.add(3600));

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

  it ('should set new parameters: feeWallet, feePercent, starts, duration, interval, ticketPrice', async function () {
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

    const feePercent = await room.feePercent();
    feePercent.should.be.bignumber.equal(newFeePercent);

    const starts = await room.starts();
    starts.should.be.bignumber.equal(newStarts);

    const lotDuration = await room.duration();
    lotDuration.should.be.bignumber.equal(newDuration);

    const interval = await room.interval();
    interval.should.be.bignumber.equal(newInterval);

    const ticketPrice = await room.ticketPrice();
    ticketPrice.should.be.bignumber.equal(newTicketPrice);

  });

  it ('should update parameters and use it', async function () {
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(600));

    const newFeePercent = 10;
    const newStarts = latestTime() + duration.seconds(10);
    const newDuration = 3700;
    const newInterval = 500;
    const newTicketPrice = ether(1.5);

    var state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const owner = await room.owner();
    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.fulfilled;

    const balancePre = web3.eth.getBalance(wallets[2]);
    const investor1BalancePre = web3.eth.getBalance(wallets[3]);
    const investor2BalancePre = web3.eth.getBalance(wallets[4]);
    const preSummary = investor1BalancePre.add(investor2BalancePre);

    // new start time is later
    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.rejectedWith(EVMRevert);
    await increaseTimeTo(newStarts);

    // new ticket price is bigger
    await room.sendTransaction({value: this.ticketPrice, from: wallets[3]}).should.be.rejectedWith(EVMRevert);  
    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: ether(2), from: wallets[4]}).should.be.fulfilled;
    const summaryInvestment = ether(3);

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

    const investor1BalancePost = web3.eth.getBalance(wallets[3]);
    const investor2BalancePost = web3.eth.getBalance(wallets[4]);
    const postSummary = investor1BalancePost.add(investor2BalancePost);
    const diff = preSummary.sub(postSummary);
    Math.round(diff.div(10000000000)).should.be.bignumber.equal(Math.round(fee.div(10000000000)));

  });

    it ('should update parameters several times', async function () {

    //--first update--//

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(600));

    var newFeePercent = 10;
    var newStarts = latestTime() + duration.days(1);
    var newDuration = 3700;
    var newInterval = 3500;
    var newTicketPrice = ether(0.2);

    var state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const owner = await room.owner();
    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.fulfilled;

    var balancePre = web3.eth.getBalance(wallets[2]);

    await increaseTimeTo(newStarts);
 
    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: newTicketPrice, from: wallets[4]}).should.be.fulfilled;
    var summaryInvestment = ether(0.4);

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime);

    state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    var balancePost = web3.eth.getBalance(wallets[2]);
    var fee = summaryInvestment.mul(newFeePercent).div(this.percentRate);
    balancePost.sub(balancePre).should.be.bignumber.equal(fee);

    //--second update--//

    lotIndex = await room.getCurLotIndex();
    lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(600));

    newFeePercent = 20;
    newStarts = latestTime() + duration.days(1);
    newDuration = 3500;
    newInterval = 3700;
    newTicketPrice = ether(0.3);

    state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: owner}).should.be.fulfilled;

    balancePre = web3.eth.getBalance(wallets[2]);

    await increaseTimeTo(newStarts);

    await room.sendTransaction({value: newTicketPrice, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: newTicketPrice, from: wallets[4]}).should.be.fulfilled;
    summaryInvestment = ether(0.6);

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime);

    state = await room.isProcessNeeds();
    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    balancePost = web3.eth.getBalance(wallets[2]);
    fee = summaryInvestment.mul(newFeePercent).div(this.percentRate);
    balancePost.sub(balancePre).should.be.bignumber.equal(fee);

  });

  it ('should update parameters only by owner', async function () {
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

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

    await room.updateParameters(wallets[2], newFeePercent, newStarts, newDuration, newInterval, newTicketPrice, {from: wallets[3]}).should.be.rejectedWith(EVMRevert);

  });

}
