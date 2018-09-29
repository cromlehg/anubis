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
    this.period = 1000;
    this.percent = 20;
    this.ticketPrice = 250000000000000000;

    controller = await LotteryController.new();
    await controller.setFeeWallet(wallets[1]);
    await controller.setFeePercent(this.percent);
    await controller.newLottery(this.period, this.ticketPrice);

    const lotteryAddress = await controller.lotteries(0);

    lottery = await Lottery.at(lotteryAddress);
  });

  
  it ('should start and finish lottery', async function () {
    const ticketPrice = await lottery.ticketPrice();

    await lottery.sendTransaction({value: ticketPrice, from: wallets[2]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[3]}).should.be.fulfilled;
    await lottery.sendTransaction({value: ticketPrice, from: wallets[4]}).should.be.fulfilled;
    
    await increaseTimeTo(this.start + duration.seconds(this.period) + duration.seconds(30));
       
    var state = await lottery.state();

    while (state != 4) {
      await controller.processFinishLottery(lottery.address);
      state = await lottery.state();
    }

  }); 

}
