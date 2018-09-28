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

  it ('should set state Accepting after start', async function () {
    const state = await lottery.state();
    assert.equal(1, state);
  }); 

  it ('should not change fee wallet after start lottery', async function () {
    await lottery.setFeeWallet(wallets[2]).should.be.rejectedWith(EVMRevert);
  }); 

  it ('should not change start date after start lottery', async function () {
    await lottery.setStart(1569403800).should.be.rejectedWith(EVMRevert);
  });

  it ('should not change period after start lottery', async function () {
    await lottery.setPeriod(2000).should.be.rejectedWith(EVMRevert);
  });

  it ('should not change fee percent after start lottery', async function () {
    const percentrate = await lottery.PERCENT_RATE();
    await lottery.setFeePercent(percentrate - 10).should.be.rejectedWith(EVMRevert);
  });

  it ('should accept payments during period time', async function () {
    await lottery.sendTransaction({value: ether(1), from: wallets[3]}).should.be.fulfilled;
    await increaseTimeTo(this.start + duration.seconds(10));
    await lottery.sendTransaction({value: ether(1), from: wallets[4]}).should.be.fulfilled;
    await increaseTimeTo(this.start + duration.seconds(this.period) - duration.seconds(10));
    await lottery.sendTransaction({value: ether(1), from: wallets[5]}).should.be.fulfilled;
  });

  it ('should not accept payments less then ticketPrice', async function () {
    const mininvest = await lottery.ticketPrice();
    await lottery.sendTransaction({value: mininvest - ether(0.01), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
    await lottery.sendTransaction({value: mininvest, from: wallets[4]}).should.be.fulfilled;
  });

  it ('should add to invest balances just ticketPrice, other send back', async function () {
    const ticketPrice = await lottery.ticketPrice();
    await lottery.sendTransaction({value: ether(10), from: wallets[3]}).should.be.fulfilled;
    const balance = await lottery.invested(wallets[3]);
    balance.should.be.bignumber.equal(ticketPrice);
  });

  it ('should not accept payments after finish time period', async function () {
    await increaseTimeTo(this.start + duration.seconds(this.period) + duration.seconds(30));
    await lottery.sendTransaction({value: ether(1), from: wallets[5]}).should.be.rejectedWith(EVMRevert);
  });

}
