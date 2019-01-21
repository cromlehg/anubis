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
    this.feePercent = 30;
    this.ticketPrice = ether(1);

    room = await Room.new();
    await room.setFeeWallet(wallets[1]);

  });

  
  it ('should start and finish lottery correctly without investments', async function () {
    const balancePre = web3.eth.getBalance(wallets[1]);
    const lotIndex = await room.getCurLotIndex();
    const lotFinishTime = await room.getNotPayableTime(lotIndex);
   
    await increaseTimeTo(lotFinishTime);
        
    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const balancePost = web3.eth.getBalance(wallets[1]);
    balancePost.sub(balancePre).should.be.bignumber.equal(0);

  });

  it ('should play for 10 tickets', async function () {
    var size = 10;

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

    var i
    for (i = 1; i < size + 2; i++){
      await room.sendTransaction({value: this.ticketPrice, from: wallets[i]}).should.be.fulfilled;
    }

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    for (i = 0; i < size; i++){
      var ticketInfo = await room.getTicketInfo(lotIndex, i);
      console.log("Win " + i + " : " + ticketInfo[2]);
    }

  });

  it ('should play for 100 tickets', async function () {
    var size = 100;

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

    var i
    for (i = 1; i < size + 2; i++){
      await room.sendTransaction({value: this.ticketPrice, from: wallets[i]}).should.be.fulfilled;
    }

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    for (i = 0; i < size; i++){
      var ticketInfo = await room.getTicketInfo(lotIndex, i);
      console.log("Win " + i + " : " + ticketInfo[2]);
    }

  });

  it ('should play for 1 ticket', async function () {
    var size = 1;

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

    var i
    for (i = 1; i < size + 2; i++){
      await room.sendTransaction({value: this.ticketPrice, from: wallets[i]}).should.be.fulfilled;
    }

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    for (i = 0; i < size; i++){
      var ticketInfo = await room.getTicketInfo(lotIndex, i);
      console.log("Win " + i + " : " + ticketInfo[2]);
    }

  });

  it ('should play for 2 tickets', async function () {
    var size = 2;

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

    var i
    for (i = 1; i < size + 2; i++){
      await room.sendTransaction({value: this.ticketPrice, from: wallets[i]}).should.be.fulfilled;
    }

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    for (i = 0; i < size; i++){
      var ticketInfo = await room.getTicketInfo(lotIndex, i);
      console.log("Win " + i + " : " + ticketInfo[2]);
    }

  });

  it ('should play for 3 tickets', async function () {
    var size = 3;

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));

    var i
    for (i = 1; i < size + 2; i++){
      await room.sendTransaction({value: this.ticketPrice, from: wallets[i]}).should.be.fulfilled;
    }

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    for (i = 0; i < size; i++){
      var ticketInfo = await room.getTicketInfo(lotIndex, i);
      console.log("Win " + i + " : " + ticketInfo[2]);
    }

  });

}
