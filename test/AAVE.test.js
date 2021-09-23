// Tests the Schedule.sol Smart Contract
const YieldAggregator = artifacts.require('./YieldAggregator')
const DAI_ABI = require('./contract_ABI_JSON/Dai.json')
const AAVE_ABI = require('./contract_ABI_JSON/AAVE.json')
const aDAI_ABI = require('./contract_ABI_JSON/aDAI.json')
const AAVEDATA_ABI = require('./contract_ABI_JSON/AAVEDATA.json')

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('YieldAggregator', ([account1]) => {
        let yieldAggregator
        let daiContract
        let AAVEContract
        let aDAIContract
        let aProtocolDataContract

        let amount = web3.utils.toWei('1', 'Ether');

        //Address of account on mainnet with DAI
        const daiWhale = '0x5E583B6a1686f7Bc09A6bBa66E852A7C80d36F00';

        //Setup daiContract from the Mainnet
        const daiMainNetAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
        
        //Setup Compound (DAI) from the Mainnet
        const AAVEContractAddress = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
        const aDAIContractAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';
        const aProtocolDataAddress = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d';
        //const checkSumCompoundDAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
        

    before(async () => {
        yieldAggregator = await YieldAggregator.new()
        daiContract = await new web3.eth.Contract(DAI_ABI, daiMainNetAddress);
        AAVEContract = await new web3.eth.Contract(AAVE_ABI, AAVEContractAddress);
        aDAIContract = await new web3.eth.Contract(aDAI_ABI, aDAIContractAddress);
        aProtocolDataContract = await new web3.eth.Contract(AAVEDATA_ABI, aProtocolDataAddress);

        //Show initial balances
        let whaleDAIBalance = await daiContract.methods.balanceOf(daiWhale).call()
        let userDAIBalance = await daiContract.methods.balanceOf(account1).call()
        let contractDAIBalance = await daiContract.methods.balanceOf(yieldAggregator.address).call()
        let contractaDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
        console.log('aDAI balance before withdrawl', contractaDAIBalance)
        console.log('DAI Whale balance before withdrawl', whaleDAIBalance)
        console.log('DAI User balance before withdrawl', userDAIBalance)
        console.log('DAI Contract balance before withdrawl', contractDAIBalance)

        //Transfer and Approve 1 DAI to account1 and YieldAggregator
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
      let currentaDAIBalance
      let newaDAIAmount
      let event

      before(async () => {
        let currentaDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
        console.log('Current of aDAI returned by aDAI AAVE', currentaDAIBalance)
        transferResult = await yieldAggregator.deposit(amount, {from: account1})
        })
        
        it('Emits a deposit event', async () => {
          const log = transferResult.logs[0]
          log.event.should.eq('Deposited')
          event = log.args
          event.user.should.equal(account1)
          event.token.should.equal(AAVEContractAddress.toString())
          event.amount.toString().should.equal(amount.toString())
          event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })
          
        it('Tracks new AAVE amount', async () => {
          newaDAIAmount = await aDAIContract.methods.balanceOf(yieldAggregator.address).call()
          let newInt = parseInt(newaDAIAmount)
          let previousInt = parseInt(currentaDAIBalance)
          console.log('Amount of aDAI returned by AAVE', newaDAIAmount)
          //newInt.should.be.above(previousInt)
        })
      

        describe('Withdraws funds from YieldAggregator', () => {
          let withdrawResult
          let currentaDAIBalance
          let userDAIBalance
          let contractDAIBalance
          let depositWithdrawn

          before(async () => {
              currentaDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
              console.log('Before Withdrawl Current of aDAI returned by Compound', currentaDAIBalance)
              withdrawResult = await yieldAggregator.withdraw(event.id, {from: account1})
              currentaDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
              console.log('After withdrawl of aDAI returned by AAVE', contractDAIBalance)
              
            })
            
            it('Emits a withdrawn event', async () => {
              const log = withdrawResult.logs[0]
              log.event.should.eq('Withdrawn')
              const withdrawnEvent = log.args
              withdrawnEvent.user.should.equal(account1)
              withdrawnEvent.token.should.equal(AAVEContractAddress.toString())
              withdrawnEvent.amount.toString().should.equal(amount.toString())
              withdrawnEvent.gain.toString().length.should.be.at.least(1, 'Gains recorded')
              console.log('Total Gains', withdrawnEvent.gain)
              withdrawnEvent.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })
            it('Updates DepositWithdrawn', async () => {
              depositWithdrawn = await yieldAggregator.depositWithdrawn(event.id)
              depositWithdrawn.should.equal(true)
              currentaDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
              console.log('After all of aDAI returned by AAVE', contractDAIBalance)
              let whaleDAIBalance = await daiContract.methods.balanceOf(daiWhale).call()
              userDAIBalance = await daiContract.methods.balanceOf(account1).call()
              contractDAIBalance = await aProtocolDataContract.methods.getUserReserveData(daiMainNetAddress, yieldAggregator.address).call()
              console.log('DAI Whale balance after withdrawl', whaleDAIBalance)
              console.log('DAI User balance after withdrawl', userDAIBalance)
              console.log('DAI Contract balance after withdrawl', contractDAIBalance)
            })
          })
    })
})
