import ether from '../helpers/ether';
import EVMRevert from '../helpers/EVMRevert';
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
    lottery = await Lottery.new();
  });

  it ('should set state Init', async function () {
    const state = await lottery.state();
    assert.equal(0, state);
  }); 

  it ('should set fee wallet', async function () {
    await lottery.setFeeWallet(wallets[1]);
    const feewallet = await lottery.feeWallet();
    assert.equal(wallets[1], feewallet);
  }); 

  it ('should set start', async function () {
    await lottery.setStart(1537867800);
    const start = await lottery.start();
    assert.equal(1537867800, start);
  });

  it ('should set period', async function () {
    await lottery.setPeriod(10);
    const period = await lottery.period();
    assert.equal(10, period);
  });

  it ('should set fee percent', async function () {
    const percentrate = await lottery.PERCENT_RATE();
    await lottery.setFeePercent(percentrate - 10);
    const feepercent = await lottery.feePercent();
    assert.equal(percentrate - 10, feepercent);
    await lottery.setFeePercent(percentrate + 10).should.be.rejectedWith(EVMRevert);
  });

  it ('should not accept payments before start', async function () {
    await lottery.sendTransaction({value: ether(1), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

}