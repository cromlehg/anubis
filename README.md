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
1. _Room1_ - https://ropsten.etherscan.io/address/0x2c7c167db4e1c38672d3cd83149adb87a1756dd8


##### Investors

* 0.1 ETH, gas = 172904
https://ropsten.etherscan.io/tx/0xf0a9b2212b15dc6ac130b231a6c8c5ad924d21d988e08cae7f0ad6e9e90d833b

* 0.2 ETH, gas = 141341
https://ropsten.etherscan.io/tx/0x7085952b8b3013e7fe984f73a7141095e9f4fcb6737fe9b54e28f16b0e944ee7

* 0.01 ETH => rejected txn, less then mininal investment limit, gas = 23385
https://ropsten.etherscan.io/tx/0x8d76d2629b058f41ada7d8adbef28d78f940da9ea48cddcddf9decad6d88233d

* 0.155 ETH, gas = 119604
https://ropsten.etherscan.io/tx/0xe5c9095696ec85b20822e9011ac7d99382561c339a987a4fea5204763201b1e0


##### Service operations

* prepareToRewardProcess, gas = 175944
https://ropsten.etherscan.io/tx/0x8296eb2ee30ac81f2b36725bb60d45b6f048c17926c447fd98aabc86df86aa68

* prepareToRewardProcess, gas = 266929
https://ropsten.etherscan.io/tx/0x2656343b5ad5fc62bc124551b8eccc1251827881965ef819ba17e15c87152bc3
