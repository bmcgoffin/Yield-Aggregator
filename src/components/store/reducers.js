import { combineReducers } from 'redux';

function web3(state = {}, action) {
  switch (action.type) {
    case 'WEB3_LOADED':
      return { ...state,  connection: action.connection }
    case 'WEB3_ACCOUNT_LOADED':
      return { ...state, account: action.account }
    default:
      return state
  }
}

function dai(state = {}, action) {
  switch (action.type) {
    case 'DAI_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}


function aave(state = {}, action) {
  switch (action.type) {
    case 'AAVE_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function aavedata(state = {}, action) {
  switch (action.type) {
    case 'AAVEDATA_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function cdai(state = {}, action) {
  switch (action.type) {
    case 'cDAI_LOADED':
      return { ...state, loaded: true, contract: action.contract }
    default:
      return state
  }
}

function yieldAggregator(state = {}, action) {
  let index, data

  switch (action.type) {
    case 'yieldAggregator_LOADED':
      return { ...state, loaded: true, contract: action.contract }

    case 'DAI_BALANCE_LOADED':
      return { ...state, daiBalance: action.balance }
    case 'aDAI_BALANCE_LOADED':
      return { ...state, aDAIBalance: action.balance }
    case 'cDAI_BALANCE_LOADED':
      return { ...state, cDAIBalance: action.balance }
    case 'BALANCES_LOADING':
      return { ...state, balancesLoading: true }
    case 'BALANCES_LOADED':
      return { ...state, balancesLoading: false }

    default:
      return state
  }
}

const rootReducer = combineReducers({
  web3,
  dai,
  aave,
  aavedata,
  cdai,
  yieldAggregator
})

export default rootReducer
