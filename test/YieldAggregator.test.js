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
        const checkSumCompoundDAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
        

    before(async () => {
        yieldAggregator = await YieldAggregator.new()
        daiContract = await new web3.eth.Contract(DAI_ABI, daiMainNetAddress);
        compoundCDaiContract = await new web3.eth.Contract(COMPOUND_ABI, compoundDContractAddress);

        let whaleDAIBalance = await daiContract.methods.balanceOf(daiWhale).call()
        let userDAIBalance = await daiContract.methods.balanceOf(account1).call()
        let contractDAIBalance = await daiContract.methods.balanceOf(yieldAggregator.address).call()
        console.log('DAI Whale balance before withdrawl', whaleDAIBalance)
        console.log('DAI User balance before withdrawl', userDAIBalance)
        console.log('DAI Contract balance before withdrawl', contractDAIBalance)

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
      let currentcDAIBalance
      let newCompoundAmount
      let event

      before(async () => {
        currentcDAIBalance = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
        console.log('Current of cDAI returned by Compound', currentcDAIBalance)
          transferResult = await yieldAggregator.deposit(amount, {from: account1})
        })
        
        it('Emits a deposit event', async () => {
          const log = transferResult.logs[0]
          log.event.should.eq('Deposited')
          event = log.args
          event.user.should.equal(account1)
          event.token.should.equal(checkSumCompoundDAddress.toString())
          event.amount.toString().should.equal(amount.toString())
          event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
          
        it('Tracks new Compound amount', async () => {

          newCompoundAmount = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
          let newInt = parseInt(newCompoundAmount)
          let previousInt = parseInt(currentcDAIBalance)
          console.log('Amount of cDAI returned by Compound', newCompoundAmount)
          newInt.should.be.above(previousInt)
        })
      

        describe('Withdraws funds from YieldAggregator', () => {
          let withdrawResult
          let currentcDAIBalance
          let userDAIBalance
          let contractDAIBalance
          let depositWithdrawn

          before(async () => {
              currentcDAIBalance = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
              console.log('Before Withdrawl Current of cDAI returned by Compound', currentcDAIBalance)
              withdrawResult = await yieldAggregator.withdraw(event.id, {from: account1})
              currentcDAIBalance = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
              console.log('After withdrawl of cDAI returned by Compound', contractDAIBalance)
              
            })
            
            it('Emits a withdrawn event', async () => {
              const log = withdrawResult.logs[0]
              log.event.should.eq('Withdrawn')
              const withdrawnEvent = log.args
              withdrawnEvent.user.should.equal(account1)
              withdrawnEvent.token.should.equal(checkSumCompoundDAddress.toString())
              withdrawnEvent.amount.toString().should.equal(amount.toString())
              withdrawnEvent.gain.toString().length.should.be.at.least(1, 'Gains recorded')
              console.log('Total Gains', withdrawnEvent.gain)
              withdrawnEvent.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })
            it('Updates DepositWithdrawn', async () => {
              depositWithdrawn = await yieldAggregator.depositWithdrawn(event.id)
              depositWithdrawn.should.equal(true)
              currentcDAIBalance = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
              console.log('After all of cDAI returned by Compound', contractDAIBalance)
              let whaleDAIBalance = await daiContract.methods.balanceOf(daiWhale).call()
              userDAIBalance = await daiContract.methods.balanceOf(account1).call()
              contractDAIBalance = await daiContract.methods.balanceOf(yieldAggregator.address).call()
              console.log('DAI User balance after withdrawl', whaleDAIBalance)
              console.log('DAI User balance after withdrawl', userDAIBalance)
              console.log('DAI Contract balance after withdrawl', contractDAIBalance)
            })
              /*
            it('Tracks new Compound amount', async () => {

              newCompoundAmount = await compoundCDaiContract.methods.balanceOf(yieldAggregator.address).call()
              let newInt = parseInt(newCompoundAmount)
              let previousInt = parseInt(currentcDAIBalance)
              console.log('Amount of cDAI returned by Compound', newCompoundAmount)
              newInt.should.be.above(previousInt)
            })
            */
          })
    })
})
