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

  it ('should not accept investments after current lottery finish time and before next will start', async function () {
    await room.sendTransaction({value: this.ticketPrice, from: wallets[2]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should start and finish lottery correctly with just one ticket', async function () {
    const balancePre = web3.eth.getBalance(wallets[1]);
    const investorBalancePre = web3.eth.getBalance(wallets[2]);
    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex);
   
    await increaseTimeTo(lotFinishTime.add(3600));    

    await room.sendTransaction({value: this.ticketPrice, from: wallets[2]}).should.be.fulfilled;

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const balancePost = web3.eth.getBalance(wallets[1]);
    const fee = this.ticketPrice.mul(this.feePercent).div(this.percentRate);
    balancePost.sub(balancePre).should.be.bignumber.equal(fee);

    const investorBalancePost = web3.eth.getBalance(wallets[2]);
    const diff = investorBalancePre.sub(investorBalancePost);
    Math.round(diff.div(10000000000)).should.be.bignumber.equal(Math.round(fee.div(10000000000)));

  });

  describe('should start and finish lottery correctly with investments', function () {
    var lotIndex;
    var lotFinishTime;

    it ('should accept investments before next lottery finish time', async function () {
      lotIndex = await room.getCurLotIndex();
      lotFinishTime = await room.getNotPayableTime(lotIndex);
      await increaseTimeTo(lotFinishTime.add(3600));

      await room.sendTransaction({value: this.ticketPrice, from: wallets[2]}).should.be.fulfilled;
      await room.sendTransaction({value: this.ticketPrice, from: wallets[3]}).should.be.fulfilled;
    });

    it ('should accept investments from one investor several times', async function () {
      await room.sendTransaction({value: this.ticketPrice, from: wallets[4]}).should.be.fulfilled;
      await room.sendTransaction({value: this.ticketPrice, from: wallets[4]}).should.be.fulfilled;
    });

    it ('should accept investments just in size multiple ticket price and send back the difference', async function () {
      const balancePre = web3.eth.getBalance(wallets[4]);
      await room.sendTransaction({value: this.ticketPrice.mul(2).add(ether(0.09)), from: wallets[4]}).should.be.fulfilled;
      const balancePost = web3.eth.getBalance(wallets[4]);
      const paydEth = balancePre.sub(balancePost);
      Math.round(paydEth.div(10000000000)).should.be.bignumber.equal(200000000);
    });

    it ('should not accept investments less then ticket price ', async function () {
      await room.sendTransaction({value: this.ticketPrice.sub(ether(0.01)), from: wallets[4]}).should.be.rejectedWith(EVMRevert);
    });

    it ('should finish lottery and send fee to feeWallet', async function () {
      const balancePre = web3.eth.getBalance(wallets[1]);

      await room.sendTransaction({value: this.ticketPrice, from: wallets[2]}).should.be.fulfilled;
      await room.sendTransaction({value: this.ticketPrice, from: wallets[3]}).should.be.fulfilled;
      await room.sendTransaction({value: this.ticketPrice, from: wallets[4]}).should.be.fulfilled;
      await room.sendTransaction({value: this.ticketPrice, from: wallets[4]}).should.be.fulfilled;
      const summaryInvestment = ether(4);

      lotIndex = await room.getCurLotIndex();  
      lotFinishTime = await room.getNotPayableTime(lotIndex);   
      await increaseTimeTo(lotFinishTime);

      var state = await room.isProcessNeeds();

      while (state) {
        await room.prepareToRewardProcess();    
        state = await room.isProcessNeeds();
      }

      const balancePost = web3.eth.getBalance(wallets[1]);
      balancePost.sub(balancePre).should.be.bignumber.equal(summaryInvestment.mul(this.feePercent).div(this.percentRate));
    });

  }); 

  it ('should correct pay reward', async function () {
    const balancePre = web3.eth.getBalance(wallets[1]);
    const investor1BalancePre = web3.eth.getBalance(wallets[6]);
    const investor2BalancePre = web3.eth.getBalance(wallets[7]);
    const investor3BalancePre = web3.eth.getBalance(wallets[8]);
    const preSummary = investor1BalancePre.add(investor2BalancePre).add(investor3BalancePre);

    var lotIndex = await room.getCurLotIndex();
    var lotFinishTime = await room.getNotPayableTime(lotIndex); 
    await increaseTimeTo(lotFinishTime.add(3600));    
    await room.sendTransaction({value: ether(5), from: wallets[6]}).should.be.fulfilled;
    await room.sendTransaction({value: ether(5), from: wallets[7]}).should.be.fulfilled;
    await room.sendTransaction({value: ether(5), from: wallets[8]}).should.be.fulfilled;
    const summaryInvestment = ether(15);

    lotIndex = await room.getCurLotIndex();  
    lotFinishTime = await room.getNotPayableTime(lotIndex);   
    await increaseTimeTo(lotFinishTime);

    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

    const balancePost = web3.eth.getBalance(wallets[1]);
    const fee = summaryInvestment.mul(this.feePercent).div(this.percentRate);
    balancePost.sub(balancePre).should.be.bignumber.equal(fee);

    const investor1BalancePost = web3.eth.getBalance(wallets[6]);
    const investor2BalancePost = web3.eth.getBalance(wallets[7]);
    const investor3BalancePost = web3.eth.getBalance(wallets[8]);
    const postSummary = investor1BalancePost.add(investor2BalancePost).add(investor3BalancePost);
    const diff = preSummary.sub(postSummary);
    Math.round(diff.div(10000000000)).should.be.bignumber.equal(Math.round(fee.div(10000000000)));
  });

}
