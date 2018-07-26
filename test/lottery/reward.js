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
    this.period = 10;
    this.percent = 100;

    lottery = await Lottery.new();
    await lottery.setStart(this.start);
    await lottery.setPeriod(this.period);
    await lottery.setFeeWallet(wallets[1]);
    await lottery.setFeePercent(this.percent);
    await lottery.startLottery();
  });

  it ('should not prepare rewarding before finish of invested period', async function () {
    await lottery.prepareToRewardProcess({from: wallets[0]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should not reward before lottery finish', async function () {
    await lottery.sendTransaction({value: ether(10), from: wallets[2]}).should.be.fulfilled;
    await lottery.reward({from: wallets[2]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should prepare rewarding, send fee to fee wallet and reward', async function () {
    const inv1 = ether(10);
    const inv2 = ether(4);
    const inv3 = ether(80);
    const inv4 = ether(6);
    await lottery.sendTransaction({value: inv1, from: wallets[2]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv2, from: wallets[3]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv3, from: wallets[4]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv4, from: wallets[5]}).should.be.fulfilled;
    const investment = inv1.add(inv2).add(inv3).add(inv4);

    const feePre = web3.eth.getBalance(wallets[1]);
    await increaseTimeTo(this.start + duration.days(this.period) + duration.seconds(30));
    await lottery.prepareToRewardProcess({from: wallets[0]}).should.be.fulfilled;
    await lottery.processReward({from: wallets[0]}).should.be.fulfilled;

    const feePost = web3.eth.getBalance(wallets[1]);
    feePost.minus(feePre).should.be.bignumber.equal(investment.mul(this.percent).div(1000));

    await lottery.reward({from: wallets[2]}).should.be.fulfilled;
    await lottery.reward({from: wallets[3]}).should.be.fulfilled;
    await lottery.reward({from: wallets[4]}).should.be.fulfilled;
    await lottery.reward({from: wallets[5]}).should.be.fulfilled;

    await lottery.reward({from: wallets[6]}).should.be.fulfilled;
    const notInvestorBalance = await lottery.winBalances(wallets[6]);
    notInvestorBalance.should.be.bignumber.equal(0);
  });  

}
