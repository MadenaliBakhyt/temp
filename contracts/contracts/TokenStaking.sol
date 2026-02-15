// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenStaking
 * @notice Production-ready staking contract using Synthetix reward distribution model
 * @dev Allows users to stake ERC-20 tokens and earn rewards over time
 *
 * Reward Model:
 * - rewardPerToken = accumulated rewards per staked token
 * - Rewards distributed linearly based on staking duration
 * - Users earn proportional to their stake and time staked
 *
 * Security:
 * - ReentrancyGuard prevents reentrancy attacks
 * - SafeERC20 prevents token transfer failures
 * - Owner cannot withdraw user stakes
 * - Proper reward accounting prevents over-distribution
 */
contract TokenStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    /// @notice The token users stake
    IERC20 public immutable stakingToken;

    /// @notice The token used for rewards (can be same as staking token)
    IERC20 public immutable rewardToken;

    /// @notice Timestamp when rewards finish
    uint256 public periodFinish;

    /// @notice Reward rate per second (rewards distributed per second)
    uint256 public rewardRate;

    /// @notice Duration of rewards period in seconds (e.g., 7 days)
    uint256 public rewardsDuration = 7 days;

    /// @notice Last time rewards were updated
    uint256 public lastUpdateTime;

    /// @notice Accumulated reward per token stored
    uint256 public rewardPerTokenStored;

    /// @notice Total amount of tokens staked in the contract
    uint256 public totalStaked;

    /// @notice User's reward per token paid (tracks what's already accounted for)
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice User's accumulated rewards (not yet claimed)
    mapping(address => uint256) public rewards;

    /// @notice User's staked balance
    mapping(address => uint256) private _balances;

    /* ========== EVENTS ========== */

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward, uint256 rewardRate, uint256 periodFinish);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);

    /* ========== ERRORS ========== */

    error ZeroAmount();
    error InsufficientBalance();
    error RewardTooHigh();
    error RewardPeriodNotFinished();

    /* ========== CONSTRUCTOR ========== */

    /**
     * @notice Initialize the staking contract
     * @param _stakingToken Address of token to be staked
     * @param _rewardToken Address of token given as reward
     * @param _owner Address of contract owner
     */
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _owner
    ) Ownable(_owner) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    /* ========== VIEWS ========== */

    /**
     * @notice Get the staked balance of an account
     * @param account Address to query
     * @return Staked token amount
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Returns the last time rewards were applicable
     * @return Timestamp of last applicable reward time
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /**
     * @notice Calculate accumulated reward per token
     * @dev Core formula: rewardPerTokenStored + (rewardRate * timeDelta * 1e18 / totalStaked)
     * @return Reward per token value scaled by 1e18
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }

    /**
     * @notice Calculate earned rewards for an account
     * @dev Formula: (balance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + rewards
     * @param account Address to calculate earnings for
     * @return Total earned rewards (claimed + unclaimed)
     */
    function earned(address account) public view returns (uint256) {
        return
            ((_balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    /**
     * @notice Get total rewards for the current period
     * @return Total reward amount for the duration
     */
    function getRewardForDuration() external view returns (uint256) {
        return rewardRate * rewardsDuration;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice Stake tokens into the contract
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();

        totalStaked += amount;
        _balances[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw staked tokens
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (_balances[msg.sender] < amount) revert InsufficientBalance();

        totalStaked -= amount;
        _balances[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Claim accumulated rewards
     */
    function claimReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /**
     * @notice Withdraw all stake and claim all rewards in one transaction
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        claimReward();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
     * @notice Add rewards to the contract and set reward rate
     * @dev Can only be called by owner
     * @param reward Amount of reward tokens to distribute over the duration
     */
    function notifyRewardAmount(uint256 reward) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= periodFinish) {
            // New reward period
            rewardRate = reward / rewardsDuration;
        } else {
            // Add to existing reward period
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardsDuration;
        }

        // Ensure the contract has enough reward tokens
        uint256 balance = rewardToken.balanceOf(address(this));

        // If staking and reward tokens are the same, subtract staked amount
        if (address(rewardToken) == address(stakingToken)) {
            balance -= totalStaked;
        }

        if (rewardRate > balance / rewardsDuration) {
            revert RewardTooHigh();
        }

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;

        emit RewardAdded(reward, rewardRate, periodFinish);
    }

    /**
     * @notice Update the rewards duration
     * @dev Can only be called when previous period is finished
     * @param _rewardsDuration New duration in seconds
     */
    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        if (block.timestamp <= periodFinish) {
            revert RewardPeriodNotFinished();
        }
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(_rewardsDuration);
    }

    /**
     * @notice Recover ERC20 tokens sent to contract by mistake
     * @dev Cannot recover staking or reward tokens if they're being used
     * @param tokenAddress Address of token to recover
     * @param tokenAmount Amount to recover
     */
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        // Cannot recover staking tokens
        require(tokenAddress != address(stakingToken), "Cannot withdraw staking token");

        // Cannot recover reward tokens if they're allocated
        if (tokenAddress == address(rewardToken)) {
            uint256 balance = rewardToken.balanceOf(address(this));

            // If same token is used for staking and rewards, account for both
            if (address(rewardToken) == address(stakingToken)) {
                balance -= totalStaked;
            }

            uint256 remaining = 0;
            if (block.timestamp < periodFinish) {
                remaining = (periodFinish - block.timestamp) * rewardRate;
            }

            require(tokenAmount <= balance - remaining, "Cannot withdraw allocated rewards");
        }

        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    /* ========== MODIFIERS ========== */

    /**
     * @notice Update reward state before modifying balances
     * @param account Address to update rewards for (address(0) updates global state only)
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
}
