![Anubis](logo.png "Anubis")

# Anubis smart contracts

## Песочница для разработки контракта лотереи


## Ropsten test #1

### Links
1. _LotteryController_ - https://ropsten.etherscan.io/address/0x2d70f55800fe08a34577c0f9272f75e2629ced65
2. _Lottery_ - https://ropsten.etherscan.io/address/0xcACc6521F61809e146b5F5B6702551526885Aa62

##### Service operations

* setFeeWallet, gas = 43741
https://ropsten.etherscan.io/tx/0xb42f7be7390cc9f1f0334c66acf7da57ef06c96ed87985308c05f504fbbe27c5

* setFeePercent, gas = 42073
https://ropsten.etherscan.io/tx/0x2a22a9ef0895a888907fd243dd90d1236eae27b63f325d2fe5326f4defe51345

* newLottery, gas = 934240
https://ropsten.etherscan.io/tx/0x7b99544a35218c6919805e7d64679c9d631ece9da2c53d407215660192b1d0fc

* processFinishLottery, gas = 191965
https://ropsten.etherscan.io/tx/0xb4473058a49fe08c84046c973207807bf013ea738c22167d01dfc42905dedd57

* processFinishLottery, gas = 181243
https://ropsten.etherscan.io/tx/0xefbfdacfb86109416faaf68ecd5b0267c3f6726d03ecdf5f6e55c696c565c708

##### Investors

* 0.2 ETH, gas = 84648
https://ropsten.etherscan.io/tx/0x236f12832e2941a97660b3bef381c57274750e0762f21270380a7c3adeb5bd5a

* 0.1 ETH, gas = 69648
https://ropsten.etherscan.io/tx/0xcf60eaada5c1e0000d56f75b9ac89b643e7efff0600e87901e06b693e78f1284

* 0.01 ETH => rejected txn, less then mininal investment limit, gas = 22206
https://ropsten.etherscan.io/tx/0x479a23a9e24fe7fdb66eb6ea763120fb633ac20e54be498881bb7a1c5d6518aa

* 0.1 ETH, gas = 69648
https://ropsten.etherscan.io/tx/0xd10a69306ea44cf796aeab8f54abf4264c76b7cc649b0089ba38567060b9d14b

* 0.1 ETH => rejected txn, lottery period is finished, gas = 21726
https://ropsten.etherscan.io/tx/0xd1e849fc8e6845abb6206bacb3464a069eca17c6b62db442356f7b7d6e002c1d

##### Reward

* reward, gas = 19508
https://ropsten.etherscan.io/tx/0x127a667b032df80d1aef85bace8d95066f49130a098766e0dd7d415079c025c6

* reward, gas = 19508
https://ropsten.etherscan.io/tx/0x777017fe27a8c8ba8fb6126713964797aa157bb22c649e536531dab5581c4756

* reward, gas = 19508
https://ropsten.etherscan.io/tx/0x87599b9e6ce882f4e956728d2869783da6af252faaa34c7ab0405d5ad1009863


## Ropsten test #2

### Links
1. _Room1_ - https://ropsten.etherscan.io/address/0x93d5bda3bdb881e3c2d9a6f379218f49cfa6be79


##### Investors

###### First lottery

* 0.1 ETH => 1 ticket, gas = 173536
https://ropsten.etherscan.io/tx/0xddfbc08c3c7da7f4590e246cd98c0fdf9bf4cde5be6e0cf441dff6ba132e41b4

* 0.2 ETH => 2 tickets, gas = 141967
https://ropsten.etherscan.io/tx/0x8d36c7615c1e7ed0634fda00c3ffebe6066e565e307bfaadbadb0c67beb96d2f

###### Second lottery (after update)

* 0.15 ETH => rejected txn, lottery is not started, gas = 22183
https://ropsten.etherscan.io/tx/0x724818bcae0647c5ead1df464dfd1dddc263373f16d6bd780771c0b6d9ca45e1

* 0.155 ETH, gas = 180236
https://ropsten.etherscan.io/tx/0x8df0c403dfbbe541a44f818cd1d753b12eab1be752d82f3d8fe7a5c66ffca9d9

* 0.3 ETH, gas = 141967
https://ropsten.etherscan.io/tx/0xb4cf3fe3dd4c03f94feedb70ae025b239e59e4dd7dfc496e852a14907b0314ad


##### Service operations

* setFeeWallet, gas = 43810
https://ropsten.etherscan.io/tx/0x3d62c361f1f0db8074ebbeabfe200b1d31c52028467f0ef9189ce1dea4c4622c

* updateParameters => rejected txn, current lottery is not finished, gas = 26619
https://ropsten.etherscan.io/tx/0x205b5d07c9308f054cf76f5b24c235eeb7994a6652ec41ceb7083d8805c5064b

* prepareToRewardProcess, gas = 178763
https://ropsten.etherscan.io/tx/0xbb3640fba7fd8f0e4cf67f8f8ba7c4bb10d0b8527b6163033646cded43a64233

* prepareToRewardProcess, gas = 213988
https://ropsten.etherscan.io/tx/0x255eda47c2e15da32179d62094599de7cef949c3ab795592522009e79ab62802

* updateParameters, gas = 76778
https://ropsten.etherscan.io/tx/0x03a0ab3d8843ae8647b998bd4c111c3d2ed8e4c965ffb62fade5a3f7447eab5a

* prepareToRewardProcess, gas = 178763
https://ropsten.etherscan.io/tx/0x2cabeeac12594b78bf6415754b50600fca00c322cea12ba0d89c2152e20586dd

* prepareToRewardProcess, gas = 183988
https://ropsten.etherscan.io/tx/0xbe83e4ac4ccb58fdab89dcec1bd15909a3d34e27cafb889637a7b8090a24a5ab
