// Tests the Schedule.sol Smart Contract
const YieldAggregator = artifacts.require('./YieldAggregator')
const DAI_ABI = require('./contract_ABI_JSON/Dai.json')
const AAVE_ABI = require('./contract_ABI_JSON/AAVE.json')
const COMPOUND_ABI = require('./contract_ABI_JSON/cDAI.json')

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('YieldAggregator', ([account1]) => {
        let yieldAggregator
        let daiContract
        let compoundCDaiContract
        let AAVEContract
        let aaveAPY
        let compoundAPY
        let _depositLocation
        let event

        let amount = web3.utils.toWei('1', 'Ether');

        //Address of account on mainnet with DAI
        const daiWhale = '0x5E583B6a1686f7Bc09A6bBa66E852A7C80d36F00';

        //Setup daiContract from the Mainnet
        const daiMainNetAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';

        //AAVE Address
        const AAVEContractAddress = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
        
        //Setup Compound (DAI) from the Mainnet
        const compoundDContractAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';
        const checkSumCompoundDAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
        

    before(async () => {
        yieldAggregator = await YieldAggregator.new()
        daiContract = await new web3.eth.Contract(DAI_ABI, daiMainNetAddress);
        compoundCDaiContract = await new web3.eth.Contract(COMPOUND_ABI, compoundDContractAddress);
        AAVEContract = await new web3.eth.Contract(AAVE_ABI, AAVEContractAddress);
    })

    describe('Get APY for each', () => {
      it('Gets AAVE Rate', async () => {
        let RAY = 10^27
    
        let aaveReserveData = await AAVEContract.methods.getReserveData(daiMainNetAddress).call()
        let aaveAPY = 100 * aaveReserveData[3]
        console.log('Percent APY', aaveAPY);
        //balanceOf.toString().should.equal(amount, 'first transfer is correct')
      })
      it('Gets Compound Rate', async () => {
        const ethMantissa = 1e18;
        const blocksPerDay = 6570; // 13.15 seconds per block
        const daysPerYear = 365;

        const supplyRatePerBlock = await compoundCDaiContract.methods.supplyRatePerBlock().call();
        const compoundAPY = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        console.log('Compound Rate: ', compoundAPY);
        //allowanceAmount.toString().should.equal(allowanceAmount, 'Allowance is correct')
      })
    })

    describe('Correctly deposits', () => {
        before(async () => {
            let transferred = await daiContract.methods.transfer(account1, amount).send({from: daiWhale})           
            let approval = await daiContract.methods.approve(yieldAggregator.address, amount).send({from: account1})
            let result = await yieldAggregator.deposit(amount, {from: account1})
            const log = result.logs[0]
            event = log.args
            _depositLocation =  await yieldAggregator.depositLocation(event.id)
        })

        if(_depositLocation == true)
        {
            console.log('Deposit went to Compound')
        }
        else
        {
            console.log('Deposit went to AAVE')
        }
        if(compoundAPY > aaveAPY)
        {
            describe('Checks if Compound was correctly deposited', () => {
                it('Checks depositLocation is true for Compound', async () => {
                    _depositLocation = await yieldAggregator.depositLocation([event.id]);
                    _depositLocation.should.be.true;
                })
            })
            console.log('Compound is greater and should be used');
        }
        else
        {
            describe('Checks if AAVE was correctly deposited', () => {
                it('Checks depositLocation is false for AAVE', async () => {
                    _depositLocation = await yieldAggregator.depositLocation([event.id]);
                    _depositLocation.should.be.false;
                })
            })
            console.log('AAVE is greater and should be used');
        }
    
    })
    describe('Correctly rebalances', () => {
        before(async () => {
            let rebalanceResult = await yieldAggregator.rebalance([event.id])
        })

        if(compoundAPY > aaveAPY && _depositLocation != true)
        {
            console.log('Compound is greater and should be used for rebalance');
            describe('Checks if Compound was correctly deposited', () => {
                it('Checks depositLocation is true for Compound', async () => {
                    _depositLocation = await yieldAggregator.depositLocation([event.id]);
                    _depositLocation.should.be.true;
                })
            })
        }
        else if(aaveAPY > compoundAPY && _depositLocation != false)
        {
            console.log('AAVE is greater and should be used for rebalance');
            describe('Checks if Compound was correctly deposited', () => {
                it('Checks depositLocation is false for AAVE', async () => {
                    _depositLocation = await yieldAggregator.depositLocation([event.id]);
                    _depositLocation.should.be.false;
                })
            })
        }
        else
        {
            describe('Verifies if deposit is already in the higher earning contract', () => {
                console.log('Deposit is already in the best returning contract')
            })
        }
    })
    
})