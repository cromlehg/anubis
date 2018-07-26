import assertRevert from '../helpers/assertRevert';

export default function (Lottery, wallets) {
  let lottery;

  beforeEach(async function () {
    lottery = await Lottery.new();
  });

  it('should have an owner', async function () {
    const owner = await lottery.owner();
    assert.isTrue(owner !== 0);
  });

  it('changes owner after transfer', async function () {
    const other = wallets[1];
    await lottery.transferOwnership(other);
    const owner = await lottery.owner();
    assert.isTrue(owner === other);
  });

  it('should prevent non-owners from transfering', async function () {
    const other = wallets[2];
    const owner = await lottery.owner();
    assert.isTrue(owner !== other);
    await assertRevert(lottery.transferOwnership(other, {from: other}));
  });

  it('should guard ownership against stuck state', async function () {
    const originalOwner = await lottery.owner();
    await assertRevert(lottery.transferOwnership(null, {from: originalOwner}));
  });
}
