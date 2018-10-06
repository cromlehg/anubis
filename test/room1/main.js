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

    room = await Room.new();

  });

  
  it ('should start and finish lottery', async function () {
    const ticketPrice = 100000000000000000;

    await room.sendTransaction({value: ticketPrice, from: wallets[2]}).should.be.fulfilled;
    await room.sendTransaction({value: ticketPrice, from: wallets[3]}).should.be.fulfilled;
    await room.sendTransaction({value: ticketPrice, from: wallets[4]}).should.be.fulfilled;
    await room.sendTransaction({value: ticketPrice, from: wallets[4]}).should.be.fulfilled;


    const lotIndex = await room.getCurLotIndex();
    const lotFinishTime = await room.getNotPayableTime(lotIndex);
   
    await increaseTimeTo(lotFinishTime);

    await room.sendTransaction({value: ticketPrice, from: wallets[5]}).should.be.rejectedWith(EVMRevert);;
        
    var state = await room.isProcessNeeds();

    while (state) {
      await room.prepareToRewardProcess();    
      state = await room.isProcessNeeds();
    }

  }); 

}
