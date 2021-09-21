pragma solidity ^0.5.16;

import {IERC20} from "./dependencies/OpenZeppelin/IERC20.sol";
import "./dependencies/OpenZeppelin/SafeMath.sol";
import "./dependencies/Compound/Compound.sol";
import "./dependencies/AAVE/ILendingPool.sol";

interface CERC20 {
    function mint(uint256) external returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint) external returns (uint);

    function redeemUnderlying(uint) external returns (uint);

    function balanceOf(address account) external view returns (uint); 
}

contract YieldAggregator {
        
    address daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address cDAIAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;

    IERC20 DAI = IERC20(daiAddress);
    CERC20 Compound = CERC20(cDAIAddress);

    //Function to get the current DAI balance of the user
    function getDAIBalance(address userAddress) external view returns (uint256) {
        uint256 result = DAI.balanceOf(userAddress);
        return (result);
    }

    function getCompoundBalance(address userAddress) external view returns (uint256) {
        uint256 result = Compound.balanceOf(userAddress);
        return (result);
    }

    function deposit(uint _amount) public returns (uint) {
                
        DAI.transferFrom(msg.sender, address(this), _amount);
        uint deposited = depositToCompound(_amount);

        return deposited;
        
        //Get Exchange rate of Compound
        

        //uint256 exchangeRateMantissa = Compound.exchangeRateCurrent();

        //Get Exchange rate of AAVE 
        
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