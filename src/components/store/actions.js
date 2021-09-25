// WEB3
export function web3Loaded(connection) {
  return {
    type: 'WEB3_LOADED',
    connection
  }
}

export function web3AccountLoaded(account) {
  return {
    type: 'WEB3_ACCOUNT_LOADED',
    account
  }
}

// YieldAggregator
export function yieldAggregatorLoaded(contract) {
  return {
    type: 'yieldAggregator_LOADED',
    contract
  }
}

// DAI
export function DAILoaded(contract) {
  return {
    type: 'DAI_LOADED',
    contract
  }
}

// AAVE
export function AAVELoaded(contract) {
  return {
    type: 'AAVE_LOADED',
    contract
  }
}

// AAVE ProtocolData
export function AAVEDATALoaded(contract) {
  return {
    type: 'AAVEDATA_LOADED',
    contract
  }
}

// cDAI ProtocolData
export function cDAILoaded(contract) {
  return {
    type: 'cDAI_LOADED',
    contract
  }
}

// Balances
export function daiBalanceLoaded(balance) {
  return {
    type: 'DAI_BALANCE_LOADED',
    balance
  }
}

export function aDAIBalanceLoaded(balance) {
  return {
    type: 'aDAI_BALANCE_LOADED',
    balance
  }
}

export function cDAIBalanceLoaded(balance) {
  return {
    type: 'cDAI_BALANCE_LOADED',
    balance
  }
}


export function balancesLoaded() {
  return {
    type: 'BALANCES_LOADED'
  }
}

export function balancesLoading() {
  return {
    type: 'BALANCES_LOADING'
  }
}

export function tokenDepositAmountChanged(amount) {
  return {
    type: 'TOKEN_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}
