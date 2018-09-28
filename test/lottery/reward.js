import ether from '../helpers/ether';
import EVMRevert from '../helpers/EVMRevert';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import {advanceBlock} from '../helpers/advanceToBlock';

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

export default function (Lottery, wallets) {
  let lottery;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.start = latestTime();
    this.period = 1000;
    this.percent = 20;
    this.ticketPrice = ether(1);

    lottery = await Lottery.new();
    await lottery.setStart(this.start);
    await lottery.setPeriod(this.period);
    await lottery.setFeeWallet(wallets[1]);
    await lottery.setFeePercent(this.percent);
    await lottery.setTicketPrice(this.ticketPrice);
    await lottery.startLottery();
  });

  it ('should not prepare rewarding before finish of invested period', async function () {
    await lottery.prepareToRewardProcess({from: wallets[0]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should prepare rewarding, send fee to fee wallet and reward', async function () {
    const ticketPrice = await lottery.ticketPrice();

    await lottery.sendTransaction({value: ticketPrice, from: wallets[2]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[3]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[4]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[5]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[6]}).should.be.fulfilled;
    
    const investment = ether(5);

    const feePre = web3.eth.getBalance(wallets[1]);
    await increaseTimeTo(this.start + duration.seconds(this.period) + duration.seconds(10));

    var state = await lottery.state();
    while (state != 3) {
      await lottery.prepareToRewardProcess({from: wallets[0]}).should.be.fulfilled;
      state = await lottery.state();
    }  

    while (state != 4) {
      await lottery.processReward({from: wallets[0]}).should.be.fulfilled;
      state = await lottery.state();
    }

    const feePost = web3.eth.getBalance(wallets[1]);
    feePost.minus(feePre).should.be.bignumber.equal(investment.mul(this.percent).div(100));
  });  

}
