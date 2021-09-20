pragma solidity ^0.5.16;

import {IERC20} from "./dependencies/OpenZeppelin/IERC20.sol";
import "./dependencies/OpenZeppelin/SafeMath";
import "./dependencies/Compound/Compound.sol";
import "./dependencies/AAVE/ILendingPool.sol";

contract YieldAggregator {
    
    address daiAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    IERC20 DAI = IERC20(daiAddress);

    //Function to get the current DAI balance of the user
    function getDAIBalance(address userAddress) external view returns (uint256) {
        uint256 result = DAI.balanceOf(userAddress);
        return (result);
    }

    function deposit() public {
        // Insert Code here
    }

    function rebalance() public {
        // Insert Code here
    }

    function withdraw() public {
        //Insert code here
    }
}