pragma solidity ^0.5.16;

import {IERC20} from "./dependencies/OpenZeppelin/IERC20.sol";
import {cDAI} from "./dependencies/cDAI.sol"; 
import "./dependencies/OpenZeppelin/SafeMath.sol";
import "./dependencies/Compound.sol";
import "./dependencies/AAVE/ILendingPool.sol";

contract YieldAggregator {
    using SafeMath for uint;

    mapping(uint256 => _Deposit) public deposits;
    mapping(address => uint256) public daiTokens;
    mapping(uint256 => bool) public depositWithdrawn;
    uint256 public depositCount;

    event Deposited(
        uint256 id,
        address user,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    event Withdrawn(
        uint256 id,
        address user,
        address token,
        uint256 amount,
        uint256 gain,
        uint256 timestamp
    );

    struct _Deposit {
        uint256 id;
        address user;
        address token;
        uint256 amount;
        uint256 gain;
        uint256 timestamp;
    }
        
    address daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address cDAIAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;

    IERC20 DAI = IERC20(daiAddress);
    cDAI Compound = cDAI(cDAIAddress);

    function deposit(uint _amount) public returns (bool) {
                
        //Create new Deposit and transfer the funds from the user account to the Smart Contract
        depositCount = depositCount.add(1);
        deposits[depositCount] = _Deposit(depositCount, msg.sender, cDAIAddress, _amount, 0, now);
        DAI.transferFrom(msg.sender, address(this), _amount);
        
        //Add amount deposited to the daiToken tracker for each user
        daiTokens[msg.sender] = daiTokens[msg.sender].add(_amount);

        //Deposit to Compound
        uint deposited = depositToCompound(_amount);

       
        
        //Get Exchange rate of Compound
        

        //uint256 exchangeRateMantissa = Compound.exchangeRateCurrent();

        //Get Exchange rate of AAVE 

        //Emit deposit event
        emit Deposited(depositCount, msg.sender, cDAIAddress, _amount, now);
        return true;
        
    }

    function rebalance() public {
        // Insert Code here
    }

    function withdraw(uint256 _id) public {

        //Get initial deposit amount and current user balance
        _Deposit storage _deposit = deposits[_id];
        
        //Get current cDAI locked in Compound by this contract
        uint256 cDaiAmount = Compound.balanceOf(address(this));
        //Withdraw from contract
        withdrawFromCompound(cDaiAmount, true);

        uint256 daiAmount = DAI.balanceOf(address(this));

        //Calculate gains while locked in contract
        uint256 gain = daiAmount.sub(_deposit.amount);
        _deposit.gain = gain;
        daiTokens[msg.sender] = daiTokens[msg.sender].add(gain);
        
        //Get latest amount after gains added
        uint256 userBalance = daiTokens[msg.sender];
        //Transfer back to original account (principal plus gains)
        DAI.transfer(_deposit.user, userBalance);

        //Update trackers to account for funds withdrawn  
        daiTokens[msg.sender] = daiTokens[msg.sender].sub(_deposit.amount);
        depositWithdrawn[_deposit.id] = true;

        //Emit withdrawn event
        emit Withdrawn(_deposit.id, msg.sender, _deposit.token, _deposit.amount, gain, now);
        
        //Add in any gains from different rebalance

        //With draw funds from Compound or Aave
        //withdrawFromCompound(userBalance, false);

    }

    function depositToCompound(uint256 _amount) public returns (uint) {       
        //Mint cTokens
        DAI.approve(cDAIAddress, _amount);
        uint mintResult = Compound.mint(_amount);

        return mintResult;
    }

    function withdrawFromCompound(uint256 _numTokensToWithdraw, bool redeemType) public returns (bool) {
        uint256 redeemResult;

        if (redeemType == true){
            //Retrieve DAI deposited
            redeemResult = Compound.redeem(_numTokensToWithdraw);
        }
        else
        {
            redeemResult = Compound.redeemUnderlying(_numTokensToWithdraw);
        }

        return true;
    }
}