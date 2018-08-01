import ether from '../helpers/ether';
import EVMRevert from '../helpers/EVMRevert';
import {increaseTimeTo, duration} from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import {advanceBlock} from '../helpers/advanceToBlock';

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();

export default function (LotteryController, Lottery, wallets) {
  let controller;
  let lottery;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.start = latestTime();
    this.period = 10;
    this.percent = 10;

    controller = await LotteryController.new();
    await controller.setFeeWallet(wallets[1]);
    await controller.setFeePercent(this.percent);
    await controller.newLottery(this.period);

    const lotteryAddress = await controller.lotteries(0);

    lottery = await Lottery.at(lotteryAddress);
  });

  it ('should collect investitions', async function () {
    const inv1 = ether(10);
    const inv2 = ether(4);
    const inv3 = ether(80);
    const inv4 = ether(6);
    await lottery.sendTransaction({value: inv1, from: wallets[2]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv2, from: wallets[3]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv3, from: wallets[4]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv4, from: wallets[5]}).should.be.fulfilled;
    const investment = inv1.add(inv2).add(inv3).add(inv4);
    const balance = web3.eth.getBalance(lottery.address);
    balance.should.be.bignumber.equal(investment);
  });

  it ('should reward', async function () {
    const inv1 = ether(10);
    const inv2 = ether(4);
    const inv3 = ether(80);
    const inv4 = ether(6);
    await lottery.sendTransaction({value: inv1, from: wallets[2]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv2, from: wallets[3]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv3, from: wallets[4]}).should.be.fulfilled;
    await lottery.sendTransaction({value: inv4, from: wallets[5]}).should.be.fulfilled;
    await increaseTimeTo(this.start + duration.days(this.period) + duration.seconds(30));
        
    var state = await lottery.state();
    while (state != 4) {
      await controller.processFinishLottery(lottery.address);
      state = await lottery.state();
    }

    await lottery.reward({from: wallets[2]}).should.be.fulfilled;
    await lottery.reward({from: wallets[3]}).should.be.fulfilled;
    await lottery.reward({from: wallets[4]}).should.be.fulfilled;
    await lottery.reward({from: wallets[5]}).should.be.fulfilled;
  }); 

}
