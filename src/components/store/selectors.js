import { createSelector } from 'reselect'
import { formatBalance } from '../helpers'


const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const daiLoaded = state => get(state, 'dai.loaded', false)
export const daiLoadedSelector = createSelector(daiLoaded, dail => dail)

const dai = state => get(state, 'dai.contract')
export const daiSelector = createSelector(dai, d => d)

const aaveLoaded = state => get(state, 'aave.loaded', false)
export const aaveLoadedSelector = createSelector(aaveLoaded, aavel => aavel)

const aave = state => get(state, 'aave.contract')
export const aaveSelector = createSelector(aave, av => av)

const aavedataLoaded = state => get(state, 'aavedata.loaded', false)
export const aavedataLoadedSelector = createSelector(aavedataLoaded, aavedl => aavedl)

const aavedata = state => get(state, 'aavedata.contract')
export const aavedataSelector = createSelector(aavedata, avd => avd)

const cdaiLoaded = state => get(state, 'cdai.loaded', false)
export const aaveLoadedSelector = createSelector(cdaiLoaded, cdl => cdl)

const cdai = state => get(state, 'cdai.contract')
export const cdaiSelector = createSelector(cdai, cd => cd)


const yieldAggregatorLoaded = state => get(state, 'yieldAggregator.loaded', false)
export const yieldAggregatorLoadedSelector = createSelector(yieldAggregatorLoaded, yal => yal)

const yieldAggregator = state => get(state, 'yieldAggregator.contract')
export const yieldAggregatorSelector = createSelector(yieldAggregator, ya => ya)

export const contractsLoadedSelector = createSelector(
  daiLoaded,
  aaveLoaded,
  aavedataLoaded,
  cdaiLoaded,
  yieldAggregatorLoaded,
  (dail, aavel, aavdl, cdl, yal) => (dail && aavel && aavdl && cdl && yal)
)

// BALANCES
const balancesLoading = state => get(state, 'yieldAggregator.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, status => status)

const daiBalance = state => get(state, 'yieldAggregator.daiBalance', 0)
export const daiBalanceSelector = createSelector(
  daiBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const aDAIBalance = state => get(state, 'yieldAggregator.aDAIbalance', 0)
export const aDAIBalanceSelector = createSelector(
  aDAIBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const cDAIBalance = state => get(state, 'yieldAggregator.cDAIbalance', 0)
export const cDAIBalanceSelector = createSelector(
  cDAIBalance,
  (balance) => {
    return formatBalance(balance)
  }
)