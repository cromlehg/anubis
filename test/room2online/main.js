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
    await advanceBlock();
  });

  beforeEach(async function () {
    room = await Room.new();
  });

  it ('constructor should init minInvestLimit', async function () {
    const minInvestLimit = await room.minInvestLimit();
    minInvestLimit.should.be.bignumber.equal(100000000000000000);
  });

  it ('constructor should init feePercent', async function () {
    const feePercent = await room.feePercent();
    feePercent.should.be.bignumber.equal(30);
  });

  it ('constructor should init feeWallet', async function () {
    const feeWallet = await room.feeWallet();
    feeWallet.should.be.bignumber.equal('0x53F22b8f420317E7CDcbf2A180A12534286CB578');

  });  

  it ('should set new feeWallet', async function () {
    await room.setFeeWallet(wallets[1]);
    const feeWallet = await room.feeWallet();
    feeWallet.should.be.bignumber.equal(wallets[1]);
  });

  it ('should not update parameters if not owner', async function () {
    const newFeeWallet = wallets[2];
    const newFeePercent = 10;
    const newMinInvestLimit = 200000000000000000;

    await room.updateParameters(newFeeWallet, newFeePercent, newMinInvestLimit, {from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should update parameters by owner', async function () {
    const owner = await room.owner();
    const newFeeWallet = wallets[2];
    const newFeePercent = 10;
    const newMinInvestLimit = 200000000000000000;

    await room.updateParameters(newFeeWallet, newFeePercent, newMinInvestLimit, {from: owner}).should.be.fulfilled;
    
    const feeWallet = await room.feeWallet();
    feeWallet.should.be.bignumber.equal(newFeeWallet);

    const feePercent = await room.feePercent();
    feePercent.should.be.bignumber.equal(newFeePercent);

    const minInvestLimit = await room.minInvestLimit();
    minInvestLimit.should.be.bignumber.equal(newMinInvestLimit);
  });

  it ('should create event ParametersUpdated', async function () {
    const owner = await room.owner();
    const newFeeWallet = wallets[2];
    const newFeePercent = 10;
    const newMinInvestLimit = 200000000000000000;

    const ParametersUpdated = await room.updateParameters(newFeeWallet, newFeePercent, newMinInvestLimit, {from: owner}).should.be.fulfilled;
    ParametersUpdated.logs[0].event.should.be.equal('ParametersUpdated');
    ParametersUpdated.logs[0].args.feeWallet.should.be.bignumber.equal(newFeeWallet);
    ParametersUpdated.logs[0].args.feePercent.should.be.bignumber.equal(newFeePercent);
    ParametersUpdated.logs[0].args.minInvestLimit.should.be.bignumber.equal(newMinInvestLimit);
  });

  it ('should not accept investments less then minInvestLimit', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit.sub(10000000000000000), from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should accept investments equal minInvestLimit', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
  });

  it ('should accept investments more then minInvestLimit', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit.add(10000000000000000), from: wallets[3]}).should.be.fulfilled;
  });

  it ('should create event TicketPurchased', async function () {
    const address = await room.address;
    const minInvestLimit = await room.minInvestLimit();
    const TicketPurchased = await room.sendTransaction({value: minInvestLimit, from: wallets[3]});
    TicketPurchased.logs[0].event.should.be.equal('TicketPurchased');
    TicketPurchased.logs[0].args.lotAddr.should.be.bignumber.equal(address);
    TicketPurchased.logs[0].args.ticketNumber.should.be.bignumber.equal(0);
    TicketPurchased.logs[0].args.player.should.be.bignumber.equal(wallets[3]);
    TicketPurchased.logs[0].args.ticketPrice.should.be.bignumber.equal(minInvestLimit);
  });

  it ('should push ticket', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const ticket = await room.getTicketInfo(0);
    ticket[0].should.be.bignumber.equal(wallets[3]);
    ticket[1].should.be.bignumber.equal(minInvestLimit);
    ticket[2].should.be.bignumber.equal(0);
    ticket[3].toString().should.be.equal('false');
  });

  it ('should send fee to feeWallet', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.setFeeWallet(wallets[1]);
    const balancePre = web3.eth.getBalance(wallets[1]);
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const balancePost = web3.eth.getBalance(wallets[1]);
    balancePost.sub(balancePre).should.be.bignumber.equal(minInvestLimit.mul(0.3));
  });

  it ('should not finishLot if not owner', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const finishTime = latestTime() + duration.seconds(10);
    await room.finishLot(finishTime, {from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should finishLot by owner', async function () {
    const owner = await room.owner();
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const finishTime = latestTime() + duration.seconds(10);
    await room.finishLot(finishTime, {from: owner}).should.be.fulfilled;
  });

  it ('should create event LotFinished', async function () {
    const owner = await room.owner();
    const address = await room.address;
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const finishTime = latestTime() + duration.seconds(10);
    const LotFinished = await room.finishLot(finishTime, {from: owner}).should.be.fulfilled;
    LotFinished.logs[0].event.should.be.equal('LotFinished');
    LotFinished.logs[0].args.lotAddr.should.be.bignumber.equal(address);
    LotFinished.logs[0].args.lotIndex.should.be.bignumber.equal(0);
  });

  it ('should finishLot without investments', async function () {
    const owner = await room.owner();
    const finishTime = latestTime() + duration.seconds(10);
    await room.finishLot(finishTime, {from: owner}).should.be.fulfilled;
  });

  it ('should not processRewards if not owner', async function () {
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    await room.processRewards([0], [30000000000000000], {from: wallets[3]}).should.be.rejectedWith(EVMRevert);
  });

  it ('should processRewards by owner', async function () {
    const owner = await room.owner();
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    await room.processRewards([0], [30000000000000000], {from: owner}).should.be.fulfilled;
  });

  it ('should create event TicketPayed', async function () {
    const owner = await room.owner();
    const address = await room.address;
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    const TicketPayed = await room.processRewards([0], [30000000000000000], {from: owner}).should.be.fulfilled;
    TicketPayed.logs[0].event.should.be.equal('TicketPayed');
    TicketPayed.logs[0].args.lotAddr.should.be.bignumber.equal(address);
    TicketPayed.logs[0].args.lotIndex.should.be.bignumber.equal(0);
    TicketPayed.logs[0].args.ticketNumber.should.be.bignumber.equal(0);
    TicketPayed.logs[0].args.player.should.be.bignumber.equal(wallets[3]);
    TicketPayed.logs[0].args.win.should.be.bignumber.equal(30000000000000000);
  });

  it ('should create events TicketPayed if two players', async function () {
    const owner = await room.owner();
    const address = await room.address;
    const minInvestLimit = await room.minInvestLimit();
    await room.sendTransaction({value: minInvestLimit, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: minInvestLimit, from: wallets[4]}).should.be.fulfilled;
    const TicketPayed = await room.processRewards([0, 1], [30000000000000000, 30000000000000000], {from: owner}).should.be.fulfilled;
    TicketPayed.logs[0].event.should.be.equal('TicketPayed');
    TicketPayed.logs[0].args.lotAddr.should.be.bignumber.equal(address);
    TicketPayed.logs[0].args.lotIndex.should.be.bignumber.equal(0);
    TicketPayed.logs[0].args.ticketNumber.should.be.bignumber.equal(0);
    TicketPayed.logs[0].args.player.should.be.bignumber.equal(wallets[3]);
    TicketPayed.logs[0].args.win.should.be.bignumber.equal(30000000000000000);
    TicketPayed.logs[1].event.should.be.equal('TicketPayed');
    TicketPayed.logs[1].args.lotAddr.should.be.bignumber.equal(address);
    TicketPayed.logs[1].args.lotIndex.should.be.bignumber.equal(0);
    TicketPayed.logs[1].args.ticketNumber.should.be.bignumber.equal(1);
    TicketPayed.logs[1].args.player.should.be.bignumber.equal(wallets[4]);
    TicketPayed.logs[1].args.win.should.be.bignumber.equal(30000000000000000);
  });

}
