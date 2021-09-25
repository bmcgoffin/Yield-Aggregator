import React, { Component } from 'react';
//import logo from '../logo.png';
import { connect } from 'react-redux'
import {
  loadWeb3,
  loadAccount,
  loadDAI,
  loadAAVE,
  loadAAVEDATA,
  loadcDAI,
  loadYieldAggregator
} from './store/interactions'
import './App.css';
import { 
   contractsLoadedSelector,
   tokenDepositAmountSelector,
   daiSelector,
   cDaiSelector,
   yieldAggregatorSelector,
   web3Selector
   } from './store/selectors'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)

    const dai = await loadDAI(web3, dispatch)
    if(!dai) {
      window.alert('Dai smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    const aave = await loadAAVE(web3, dispatch)
    if(!aave) {
      window.alert('AAVE smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    const aavedata = await loadAAVEDATA(web3, dispatch)
    if(!aavedata) {
      window.alert('AAVEDATA smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    const cdai = await loadcDAI(web3, dispatch)
    if(!cdai) {
      window.alert('cDAI smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    const yieldAggregator = await loadYieldAggregator(web3, networkId, dispatch)
    if(!yieldAggregator) {
      window.alert('yieldAggregator smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
  }


  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://github.com/bmcgoffin/Yield-Aggregator"
            target="_blank"
            rel="noopener noreferrer"
          >
            Yield Aggregator DAPP
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h2>Investment Commands:</h2>
                <form className="row" onSubmit={(event) => {
                  event.preventDefault()
                  deposit(dispatch, yieldAggregator, web3, amount, account)
                }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
              type="text"
              placeholder="Deposit Amount"
              onChange={(e) => dispatch( tokenDepositAmountChanged(e.target.value) ) }
              className="form-control form-control-sm bg-dark text-white"
              required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>
            </div>
          </form>
          <form className="row" onSubmit={(event) => {
                  event.preventDefault()
                  rebalance(dispatch, yieldAggregator, web3, account)
                }}>
            <div className="col-12 col-sm pr-sm-2">
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Rebalance</button>
            </div>
          </form>
          <form className="row" onSubmit={(event) => {
                  event.preventDefault()
                  withdraw(dispatch, yieldAggregator, web3, account)
                }}>
            <div className="col-12 col-sm pr-sm-2">
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
              <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>
            </div>
          </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
    dai:  daiSelector(state),
    aDai: aDaiSelector(state),
    cDai: cDaiSelector(state),
    yieldAggregator: yieldAggregatorSelector(state),
    web3: web3Selector(state),
    account: accountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    balancesLoading,
  }
}

export default connect(mapStateToProps)(App)
