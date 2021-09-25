pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import {IERC20} from "./dependencies/OpenZeppelin/IERC20.sol";
import {cDAI} from "./dependencies/cDAI.sol"; 
import {ILendingPool} from "./dependencies/AAVE/ILendingPool.sol";
import {DataTypes} from './dependencies/AAVE/DataTypes.sol';
//import {ProtocolData} from "./dependencies/AAVE/AaveProtocolDataProvider.sol";
//import {ILendingPoolAddressesProvider} from "./dependencies/AAVE/ILendingPoolAddressesProvider";
import "./dependencies/OpenZeppelin/SafeMath.sol";
import "./dependencies/Compound.sol";


contract YieldAggregator {
    using SafeMath for uint;
    
    //Smart Contract Integrations (DAI, cDAI-Compound, AAVE)
    address DAIAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address cDAIAddress = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
    address AAVEAddress = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
    address aDAIAddress = 0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d;
    //address aProtocolDataProvider = 0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d;

    IERC20 DAI = IERC20(DAIAddress);
    cDAI Compound = cDAI(cDAIAddress);
    ILendingPool AAVE = ILendingPool(AAVEAddress);
    //ProtocolData AAVEDATA = ProtocolData(aProtocolDataProvider);
    IERC20 aDAI = IERC20(aDAIAddress);

    //Public Mappings and Counts
    mapping(uint256 => _Deposit) public deposits;
    mapping(address => uint256) public daiTokens;
    mapping(uint256 => bool) public depositWithdrawn;
    //True == Compound and False == AAVE
    mapping(uint256 => bool) public depositLocation;
    uint256 public depositCount;

    //Contract Events
    event Deposited(
        uint256 id,
        address user,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    event Rebalanced(
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
    
    //Contract Structs
    struct _Deposit {
        uint256 id;
        address user;
        address token;
        uint256 amount;
        uint256 gain;
        uint256 timestamp;
    }

    //Contract Functions
    function deposit(uint _amount) public returns (bool) {
        //Create new Deposit and transfer the funds from the user account to the Smart Contract
        depositCount = depositCount.add(1);
        
        DAI.transferFrom(msg.sender, address(this), _amount);
        
        //Add amount deposited to the daiToken tracker for each user
        daiTokens[msg.sender] = daiTokens[msg.sender].add(_amount);

        //Get Compound and AAVE Rates
        uint256 compoundAPY = getCompoundAPY();
        uint256 aaveAPY = getAAVEAPY();

        if (compoundAPY > aaveAPY) {
            depositToCompound(_amount);
            depositLocation[depositCount] = true;
            deposits[depositCount] = _Deposit(depositCount, msg.sender, cDAIAddress, _amount, 0, now);
            emit Deposited(depositCount, msg.sender, cDAIAddress, _amount, now);
        }
        else
        {
            depositToAAVE(_amount);
            depositLocation[depositCount] = false;
            deposits[depositCount] = _Deposit(depositCount, msg.sender, AAVEAddress, _amount, 0, now);
            emit Deposited(depositCount, msg.sender, AAVEAddress, _amount, now);
        }

        return true;                    
    }

    function rebalance(uint256 _id) public {
        _Deposit storage _deposit = deposits[_id];
        require(address(_deposit.user) == msg.sender);
        
        //Get Compound and AAVE Rates
        uint256 compoundAPY = getCompoundAPY();
        uint256 aaveAPY = getAAVEAPY();

        if (compoundAPY > aaveAPY && depositLocation[_id] != true) {
            withdrawFromAAVE();
            calcGains();
            depositToCompound(daiTokens[msg.sender]);
            depositLocation[_id] = true;
            emit Rebalanced(msg.sender, cDAIAddress, daiTokens[msg.sender], now);
        }
        if (aaveAPY > compoundAPY && depositLocation[_id] != false)
        {   
            withdrawFromCompound(false);
            calcGains();
            depositToAAVE(daiTokens[msg.sender]);
            depositLocation[_id] = false;
            emit Rebalanced(msg.sender, AAVEAddress, daiTokens[msg.sender], now);
        }
    }

    function withdraw(uint256 _id) public {
        //Get initial deposit amount and current user balance
        _Deposit storage _deposit = deposits[_id];
        require(address(_deposit.user) == msg.sender);
                
        //Withdraw from AAVE or Compound contract
        if(depositLocation[_deposit.id] == true)
        {
            withdrawFromCompound(true);
        }
        else
        {
            withdrawFromAAVE();
        }
        
        calcGains();
        _deposit.gain = daiTokens[msg.sender].sub(_deposit.amount);

        //Get latest amount after gains added
        uint256 userBalance = daiTokens[msg.sender];
 
        //Update trackers to account for funds withdrawn  
        daiTokens[msg.sender] = daiTokens[msg.sender].sub(userBalance);
        depositWithdrawn[_deposit.id] = true;

        //Transfer back to original account (principal plus gains)
        DAI.transfer(_deposit.user, userBalance);

        //Emit withdrawn event
        emit Withdrawn(_deposit.id, msg.sender, _deposit.token, _deposit.amount, _deposit.gain, now);

    }

    function calcGains() private {
        
        //Get DAI balance of contract after withdraw from AAVE/Compound
        uint256 daiAmount = DAI.balanceOf(address(this));

        //Calculate gains while locked in contract
        uint256 gain = (daiAmount).sub(daiTokens[msg.sender]);

        //Add in new gains to running total
        daiTokens[msg.sender] = daiTokens[msg.sender].add(gain);
    }

    function getAAVEAPY() private view returns (uint256) {
        uint256 percentDepositAPY;
        uint256 RAY = 10^27;
    
        DataTypes.ReserveData memory aaveReserveData = AAVE.getReserveData(DAIAddress);
        percentDepositAPY = 100 * aaveReserveData.currentLiquidityRate / RAY;

        return percentDepositAPY;
    }

    function depositToAAVE(uint256 _amount) private returns (bool) {
        DAI.approve(AAVEAddress, _amount);
        AAVE.deposit(DAIAddress, _amount, address(this), 0);

        return true;
    }

    function withdrawFromAAVE() private returns (bool) {
        //Use Max to pull out all funds
        uint256 MAX_INT = 2**256 - 1;
        AAVE.withdraw(DAIAddress, MAX_INT, address(this));

        return true;
    }

    function getCompoundAPY() private returns (uint256) {
        uint256 ethMantissa = 1e18;
        uint256 blocksPerDay = 6570; // 13.15 seconds per block
        uint256 daysPerYear = 365;
        uint256 supplyRatePerBlock;
        uint256 supplyAPY;

        supplyRatePerBlock = Compound.supplyRatePerBlock();
        supplyAPY = ((((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1) ** daysPerYear) -1) * 100;

        return supplyAPY;
    }

    function depositToCompound(uint256 _amount) public returns (bool) {       
        DAI.approve(cDAIAddress, _amount);
        Compound.mint(_amount);

        return true;
    }

    function withdrawFromCompound(bool redeemType) public returns (bool) {

        uint256 cDaiAmount = Compound.balanceOf(address(this));

        if (redeemType == true){
            Compound.redeem(cDaiAmount);
        }
        else
        {
            Compound.redeemUnderlying(cDaiAmount);
        }

        return true;
    }
}