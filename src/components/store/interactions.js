import Web3 from 'web3'
import {
  web3Loaded,
  web3AccountLoaded,
  yieldAggregatorLoaded,
  DAILoaded,
  AAVELoaded,
  AAVEDATALoaded,
  cDAILoaded,
  daiBalanceLoaded,
  aDAIBalanceLoaded,
  cDAIBalanceLoaded,
  balancesLoaded,
  balancesLoading,
} from './actions'
import YieldAggregator from '../abis/YieldAggregator.json'
import DAI from '../abis/DAI.js'
import cDAI from '../abis/cDAI.js'
import AAVE from '../abis/AAVE.js'
import AAVEDATA from '../abis/AAVEDATA.js'

  //DAI from Mainnet
  const daiMainNetAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const daiWhale = '0x5E583B6a1686f7Bc09A6bBa66E852A7C80d36F00';

  //AAVE Address Mainnet
  const AAVEContractAddress = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
  const aProtocolDataAddress = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d';
    
  //Compound (cDAI) Mainnet
  const cDaiContractAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';

export const loadWeb3 = async (dispatch) => {
  if(typeof window.ethereum!=='undefined'){
    const web3 = new Web3(window.ethereum)
    dispatch(web3Loaded(web3))
    return web3
  } else {
    window.alert('Please install MetaMask')
    window.location.assign("https://metamask.io/")
  }
}

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]
  dispatch(web3AccountLoaded(account))
  return account
}

export const loadYieldAggregator = async (web3, networkId, dispatch) => {
  try {
    const yieldAggregator = new web3.eth.Contract(YieldAggregator.abi, YieldAggregator.networks[networkId].address)
    dispatch(yieldAggregatorLoaded(yieldAggregator))
    return yieldAggregator
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadDAI = async (web3, dispatch) => {
  try {
    const dai = new web3.eth.Contract(DAI.abi, daiMainNetAddress)
    dispatch(DAILoaded(dai))
    return dai
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadAAVE = async (web3, dispatch) => {
  try {
    const aave = new web3.eth.Contract(AAVE.abi, AAVEContractAddress)
    dispatch(AAVELoaded(dai))
    return aave
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadAAVEDATA = async (web3, dispatch) => {
  try {
    const aaveData = new web3.eth.Contract(AAVEDATA.abi, aProtocolDataAddress)
    dispatch(AAVEDATALoaded(aaveData))
    return aaveData
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const loadcDAI = async (web3, dispatch) => {
  try {
    const cdai = new web3.eth.Contract(cDAI.abi, cDaiContractAddress)
    dispatch(cDAILoaded(cdai))
    return cdai
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const subscribeToEvents = async (yieldAggregator, dispatch) => {
  yieldAggregator.events.Deposited({}, (error, event) => {
    dispatch(deposited(event.returnValues))
  })
  yieldAggregator.events.Rebalanced({}, (error, event) => {
    dispatch(rebalanced(event.returnValues))
  })
  yieldAggregator.events.Withdrawn({}, (error, event) => {
    dispatch(Withdrawn(event.returnValues))
  })
}


export const loadBalances = async (dispatch, web3, yieldAggregator, dai, cDai, AAVE, AAVEDATA, account) => {
  if(typeof account !== 'undefined') {
      // Ether balance in wallet
      const daiBalance = await dai.methods.getBalance(account)
      dispatch(daiBalanceLoaded(daiBalance))

      // aDai balance in AAVE
      const aDAIBalance = await AAVEDATA.methods.getUserReserveData(daiMainNetAddress, YieldAggregator.networks[networkId].address).call()
      dispatch(aDAIBalanceLoaded(aDAIBalance))

      // cDAI balance in Compound
      const cDAIBalance = await cDai.methods.balanceOf(YieldAggregator.networks[networkId].address).call()
      dispatch(cDAIBalanceLoaded(cDAIBalance))

      // Trigger all balances loaded
      dispatch(balancesLoaded())
    } else {
      window.alert('Please login with MetaMask')
    }
}

export const deposit = (dispatch, yieldAggregator, web3, dai, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether')

  dai.methods.approve(yieldAggregator.options.address, amount).send({ from: account })
  .on('transactionHash', (hash) => {
    yieldAggregator.methods.depositToken(amount).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
      console.error(error)
      window.alert(`There was an error!`)
    })
  })
}

export const rebalance = (dispatch, yieldAggregator, _id, account) => {
  yieldAggregator.methods.rebalance(_id).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const withdraw = (dispatch, yieldAggregator, _id, account) => {
  yieldAggregator.methods.withdraw(_id).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}