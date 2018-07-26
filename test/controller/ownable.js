import assertRevert from '../helpers/assertRevert';

export default function (Controller, wallets) {
  let controller;

  beforeEach(async function () {
    controller = await Controller.new();
  });

  it('should have an owner', async function () {
    const owner = await controller.owner();
    assert.isTrue(owner !== 0);
  });

  it('changes owner after transfer', async function () {
    const other = wallets[1];
    await controller.transferOwnership(other);
    const owner = await controller.owner();
    assert.isTrue(owner === other);
  });

  it('should prevent non-owners from transfering', async function () {
    const other = wallets[2];
    const owner = await controller.owner();
    assert.isTrue(owner !== other);
    await assertRevert(controller.transferOwnership(other, {from: other}));
  });

  it('should guard ownership against stuck state', async function () {
    const originalOwner = await controller.owner();
    await assertRevert(controller.transferOwnership(null, {from: originalOwner}));
  });
}
