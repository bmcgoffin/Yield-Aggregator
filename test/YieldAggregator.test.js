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

    describe('Verify DAI Access, Transfer, and Approval', () => {
      it('Gets AAVE Rate', async () => {
        let RAY = 10^27
    
        let aaveReserveData = await AAVEContract.methods.getReserveData(daiMainNetAddress).call()
        let percentDepositAPY = 100 * aaveReserveData[3]
        console.log(aaveReserveData[3], 'Percent APY', percentDepositAPY);
        //balanceOf.toString().should.equal(amount, 'first transfer is correct')
      })
      it('Gets Compound Rate', async () => {
        const ethMantissa = 1e18;
        const blocksPerDay = 6570; // 13.15 seconds per block
        const daysPerYear = 365;

        const supplyRatePerBlock = await compoundCDaiContract.methods.supplyRatePerBlock().call();
        const supplyAPY = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
        console.log(supplyAPY);
        //allowanceAmount.toString().should.equal(allowanceAmount, 'Allowance is correct')
      })
    })
})