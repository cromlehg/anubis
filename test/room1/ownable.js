import assertRevert from '../helpers/assertRevert';

export default function (Room, wallets) {
  let room;

  beforeEach(async function () {
    room = await Room.new();
  });

  it('should have an owner', async function () {
    const owner = await room.owner();
    assert.isTrue(owner !== 0);
  });

  it('changes owner after transfer', async function () {
    const other = wallets[1];
    await room.transferOwnership(other);
    const owner = await room.owner();
    assert.isTrue(owner === other);
  });

  it('should prevent non-owners from transfering', async function () {
    const other = wallets[2];
    const owner = await room.owner();
    assert.isTrue(owner !== other);
    await assertRevert(room.transferOwnership(other, {from: other}));
  });

  it('should guard ownership against stuck state', async function () {
    const originalOwner = await room.owner();
    await assertRevert(room.transferOwnership(null, {from: originalOwner}));
  });
}
