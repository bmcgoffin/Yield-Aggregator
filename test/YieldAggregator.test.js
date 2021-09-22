// Tests the Schedule.sol Smart Contract
const YieldAggregator = artifacts.require('./YieldAggregator')
const DAI_ABI = require('./contract_ABI_JSON/Dai.json')
const COMPOUND_ABI = require('./contract_ABI_JSON/Compound.json')

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('YieldAggregator', ([account1]) => {
        let yieldAggregator
        let daiContract
        let compoundCDaiContract
        let amount = web3.utils.toWei('1', 'Ether');

        //Address of account on mainnet with DAI
        const daiWhale = '0x5E583B6a1686f7Bc09A6bBa66E852A7C80d36F00';

        //Setup daiContract from the Mainnet
        const daiMainNetAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
        
        //Setup Compound (DAI) from the Mainnet
        const compoundDContractAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';
        

    beforeEach(async () => {
        yieldAggregator = await YieldAggregator.new()
        daiContract = await new web3.eth.Contract(DAI_ABI, daiMainNetAddress);
        compoundCDaiContract = await new web3.eth.Contract(COMPOUND_ABI, compoundDContractAddress);

        let transferred = await daiContract.methods.transfer(account1, amount).send({from: daiWhale})           
        let approval = await daiContract.methods.approve(yieldAggregator.address, amount).send({from: account1})
        let approved = await daiContract.methods.allowance(account1, yieldAggregator.address).call({from: account1})
    })

    describe('Verify DAI Access, Transfer, and Approval', () => {
      it('Access DAI and can transfer tokens', async () => {
        let balanceOf = await daiContract.methods.balanceOf(account1).call()
        //balanceOf.toString().should.equal(amount, 'first transfer is correct')
      })
      it('Approves amount to YieldAggregator Contract', async () => {
        let allowanceAmount = await daiContract.methods.allowance(account1, yieldAggregator.address).call({from: account1})
        //allowanceAmount.toString().should.equal(allowanceAmount, 'Allowance is correct')
      })
    })

    describe('Deposits to Compound or AAVE', () => {
      let transferResult
      
      beforeEach(async () => {
          transferResult = await yieldAggregator.deposit(amount, {from: account1})
        })
        it('Emits a deposit event', async () => {
          const log = transferResult.logs[0]
          log.event.should.eq('Deposited')
          const event = log.args
          event.user.should.equal(account1)
          event.token.should.equal(compoundDContractAddress)
          event.amount.toString().should.equal(amount.toString())
        })
          })
})
