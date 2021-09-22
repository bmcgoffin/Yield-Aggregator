pragma solidity ^0.5.16;

import {IERC20} from "./dependencies/OpenZeppelin/IERC20.sol";
import {cDAI} from "./dependencies/cDAI.sol"; 
import "./dependencies/OpenZeppelin/SafeMath.sol";
import "./dependencies/Compound.sol";
import "./dependencies/AAVE/ILendingPool.sol";

contract YieldAggregator {
    using SafeMath for uint;

    mapping(uint256 => _Deposit) public deposits;
    uint256 public depositCount;

    event Deposited(
        uint256 id,
        address user,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    struct _Deposit {
        uint256 id;
        address user;
        address token;
        uint256 amount;
        uint256 timestamp;
    }
        
    address daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address cDAIAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;

    IERC20 DAI = IERC20(daiAddress);
    cDAI Compound = cDAI(cDAIAddress);

    //Function to get the current DAI balance of the user
    function getDAIBalance(address userAddress) external view returns (uint256) {
        uint256 result = DAI.balanceOf(userAddress);
        return (result);
    }

    function getCompoundBalance(address userAddress) external view returns (uint256) {
        uint256 result = Compound.balanceOf(userAddress);
        return (result);
    }

    function deposit(uint _amount) public returns (bool) {
                
        depositCount = depositCount.add(1);
        deposits[depositCount] = _Deposit(depositCount, msg.sender, cDAIAddress, _amount, now);
        DAI.transferFrom(msg.sender, address(this), _amount);
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

    function withdraw() public {

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