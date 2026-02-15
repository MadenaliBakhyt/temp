import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TokenStaking, YourToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenStaking", function () {
  let stakingToken: YourToken;
  let rewardToken: YourToken;
  let staking: TokenStaking;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;

  const REWARD_AMOUNT = ethers.parseEther("10000"); // 10,000 tokens
  const REWARD_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
  const STAKE_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy ERC20 tokens for staking and rewards
    const YourTokenFactory = await ethers.getContractFactory("YourToken");

    // Deploy staking token
    stakingToken = await YourTokenFactory.deploy(
      "Staking Token",
      "STK",
      18,
      ethers.parseEther("1000000"),
      ethers.parseEther("1000000"),
      owner.address
    );
    await stakingToken.waitForDeployment();

    // Deploy reward token
    rewardToken = await YourTokenFactory.deploy(
      "Reward Token",
      "RWD",
      18,
      ethers.parseEther("1000000"),
      ethers.parseEther("1000000"),
      owner.address
    );
    await rewardToken.waitForDeployment();

    // Deploy staking contract
    const TokenStakingFactory = await ethers.getContractFactory("TokenStaking");
    staking = await TokenStakingFactory.deploy(
      await stakingToken.getAddress(),
      await rewardToken.getAddress(),
      owner.address
    );
    await staking.waitForDeployment();

    // Distribute staking tokens to users
    await stakingToken.transfer(user1.address, ethers.parseEther("1000"));
    await stakingToken.transfer(user2.address, ethers.parseEther("1000"));
    await stakingToken.transfer(user3.address, ethers.parseEther("1000"));

    // Fund staking contract with reward tokens
    await rewardToken.transfer(await staking.getAddress(), REWARD_AMOUNT);

    // Approve staking contract to spend tokens
    await stakingToken.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await stakingToken.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
    await stakingToken.connect(user3).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await staking.stakingToken()).to.equal(await stakingToken.getAddress());
    });

    it("Should set the correct reward token", async function () {
      expect(await staking.rewardToken()).to.equal(await rewardToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total staked", async function () {
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should set default rewards duration to 7 days", async function () {
      expect(await staking.rewardsDuration()).to.equal(REWARD_DURATION);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await expect(staking.connect(user1).stake(STAKE_AMOUNT))
        .to.emit(staking, "Staked")
        .withArgs(user1.address, STAKE_AMOUNT);

      expect(await staking.balanceOf(user1.address)).to.equal(STAKE_AMOUNT);
      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("Should transfer staking tokens from user to contract", async function () {
      const userBalanceBefore = await stakingToken.balanceOf(user1.address);
      const contractBalanceBefore = await stakingToken.balanceOf(await staking.getAddress());

      await staking.connect(user1).stake(STAKE_AMOUNT);

      expect(await stakingToken.balanceOf(user1.address)).to.equal(
        userBalanceBefore - STAKE_AMOUNT
      );
      expect(await stakingToken.balanceOf(await staking.getAddress())).to.equal(
        contractBalanceBefore + STAKE_AMOUNT
      );
    });

    it("Should revert when staking zero amount", async function () {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWithCustomError(
        staking,
        "ZeroAmount"
      );
    });

    it("Should allow multiple stakes from same user", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);

      expect(await staking.balanceOf(user1.address)).to.equal(STAKE_AMOUNT * 2n);
      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT * 2n);
    });

    it("Should track multiple users staking", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await staking.connect(user2).stake(STAKE_AMOUNT * 2n);

      expect(await staking.balanceOf(user1.address)).to.equal(STAKE_AMOUNT);
      expect(await staking.balanceOf(user2.address)).to.equal(STAKE_AMOUNT * 2n);
      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT * 3n);
    });
  });

  describe("Withdrawing", function () {
    beforeEach(async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
    });

    it("Should allow users to withdraw staked tokens", async function () {
      await expect(staking.connect(user1).withdraw(STAKE_AMOUNT))
        .to.emit(staking, "Withdrawn")
        .withArgs(user1.address, STAKE_AMOUNT);

      expect(await staking.balanceOf(user1.address)).to.equal(0);
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should transfer tokens back to user", async function () {
      const userBalanceBefore = await stakingToken.balanceOf(user1.address);

      await staking.connect(user1).withdraw(STAKE_AMOUNT);

      expect(await stakingToken.balanceOf(user1.address)).to.equal(
        userBalanceBefore + STAKE_AMOUNT
      );
    });

    it("Should revert when withdrawing zero amount", async function () {
      await expect(staking.connect(user1).withdraw(0)).to.be.revertedWithCustomError(
        staking,
        "ZeroAmount"
      );
    });

    it("Should revert when withdrawing more than staked", async function () {
      await expect(
        staking.connect(user1).withdraw(STAKE_AMOUNT + ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(staking, "InsufficientBalance");
    });

    it("Should allow partial withdrawals", async function () {
      const withdrawAmount = STAKE_AMOUNT / 2n;
      await staking.connect(user1).withdraw(withdrawAmount);

      expect(await staking.balanceOf(user1.address)).to.equal(withdrawAmount);
      expect(await staking.totalStaked()).to.equal(withdrawAmount);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      // Notify reward amount to start distribution
      await staking.notifyRewardAmount(REWARD_AMOUNT);
    });

    it("Should set reward rate correctly", async function () {
      const expectedRate = REWARD_AMOUNT / BigInt(REWARD_DURATION);
      expect(await staking.rewardRate()).to.equal(expectedRate);
    });

    it("Should set period finish correctly", async function () {
      const currentTime = await time.latest();
      const periodFinish = await staking.periodFinish();

      expect(periodFinish).to.be.closeTo(currentTime + REWARD_DURATION, 2);
    });

    it("Should accumulate rewards over time", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);

      // Fast forward 1 day
      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);

      // Expected reward for 1 day = (rewardAmount / 7 days) * 1 day
      const expectedReward = REWARD_AMOUNT / 7n;
      // Allow 1% margin for rounding
      expect(earned).to.be.closeTo(expectedReward, expectedReward / 100n);
    });

    it("Should distribute rewards proportionally to stake", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await staking.connect(user2).stake(STAKE_AMOUNT * 2n); // User2 stakes 2x

      await time.increase(24 * 60 * 60); // 1 day

      const earned1 = await staking.earned(user1.address);
      const earned2 = await staking.earned(user2.address);

      // User2 should earn approximately 2x of user1
      expect(earned2).to.be.closeTo(earned1 * 2n, earned1 / 10n); // 10% margin
    });

    it("Should allow claiming rewards", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      const balanceBefore = await rewardToken.balanceOf(user1.address);

      await expect(staking.connect(user1).claimReward())
        .to.emit(staking, "RewardPaid")
        .withArgs(user1.address, earned);

      expect(await rewardToken.balanceOf(user1.address)).to.equal(balanceBefore + earned);
      expect(await staking.earned(user1.address)).to.equal(0);
    });

    it("Should continue accumulating rewards after claim", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);

      await staking.connect(user1).claimReward();

      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);
    });

    it("Should handle rewards when no one is staking", async function () {
      await time.increase(24 * 60 * 60);

      // Now stake after some time has passed
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      // Should only earn for the time they were staked
      const expectedReward = REWARD_AMOUNT / 7n;
      expect(earned).to.be.closeTo(expectedReward, expectedReward / 10n);
    });

    it("Should stop accumulating rewards after period ends", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);

      // Fast forward past period finish
      await time.increase(REWARD_DURATION + 24 * 60 * 60);

      const earned = await staking.earned(user1.address);

      // Should earn approximately all rewards (allowing for precision)
      expect(earned).to.be.closeTo(REWARD_AMOUNT, REWARD_AMOUNT / 100n);

      // Additional time shouldn't increase rewards
      await time.increase(24 * 60 * 60);
      const earnedAfter = await staking.earned(user1.address);

      expect(earnedAfter).to.equal(earned);
    });
  });

  describe("Exit", function () {
    beforeEach(async function () {
      await staking.notifyRewardAmount(REWARD_AMOUNT);
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);
    });

    it("Should withdraw stake and claim rewards", async function () {
      const earned = await staking.earned(user1.address);
      const stakingBalanceBefore = await stakingToken.balanceOf(user1.address);
      const rewardBalanceBefore = await rewardToken.balanceOf(user1.address);

      await staking.connect(user1).exit();

      expect(await staking.balanceOf(user1.address)).to.equal(0);
      expect(await stakingToken.balanceOf(user1.address)).to.equal(
        stakingBalanceBefore + STAKE_AMOUNT
      );
      expect(await rewardToken.balanceOf(user1.address)).to.equal(rewardBalanceBefore + earned);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to notify reward amount", async function () {
      await expect(staking.notifyRewardAmount(REWARD_AMOUNT))
        .to.emit(staking, "RewardAdded");
    });

    it("Should revert if non-owner tries to notify rewards", async function () {
      await expect(
        staking.connect(user1).notifyRewardAmount(REWARD_AMOUNT)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("Should allow updating rewards duration when period finished", async function () {
      const newDuration = 14 * 24 * 60 * 60; // 14 days

      await expect(staking.setRewardsDuration(newDuration))
        .to.emit(staking, "RewardsDurationUpdated")
        .withArgs(newDuration);

      expect(await staking.rewardsDuration()).to.equal(newDuration);
    });

    it("Should revert when updating duration during active period", async function () {
      await staking.notifyRewardAmount(REWARD_AMOUNT);

      await expect(
        staking.setRewardsDuration(14 * 24 * 60 * 60)
      ).to.be.revertedWithCustomError(staking, "RewardPeriodNotFinished");
    });

    it("Should prevent notifying reward amount exceeding available balance", async function () {
      const excessiveReward = ethers.parseEther("100000"); // More than funded

      await expect(
        staking.notifyRewardAmount(excessiveReward)
      ).to.be.revertedWithCustomError(staking, "RewardTooHigh");
    });

    it("Should allow owner to recover mistakenly sent tokens", async function () {
      const YourTokenFactory = await ethers.getContractFactory("YourToken");
      const recoveryToken = await YourTokenFactory.deploy(
        "Recovery",
        "REC",
        18,
        ethers.parseEther("1000"),
        ethers.parseEther("1000"),
        owner.address
      );
      await recoveryToken.waitForDeployment();

      const recoverAmount = ethers.parseEther("100");
      await recoveryToken.transfer(await staking.getAddress(), recoverAmount);

      await expect(staking.recoverERC20(await recoveryToken.getAddress(), recoverAmount))
        .to.emit(staking, "Recovered")
        .withArgs(await recoveryToken.getAddress(), recoverAmount);
    });

    it("Should prevent recovering staking tokens", async function () {
      await expect(
        staking.recoverERC20(await stakingToken.getAddress(), ethers.parseEther("1"))
      ).to.be.revertedWith("Cannot withdraw staking token");
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await staking.notifyRewardAmount(REWARD_AMOUNT);
    });

    it("Should handle single user staking entire period", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(REWARD_DURATION);

      const earned = await staking.earned(user1.address);

      // Should earn approximately all rewards
      expect(earned).to.be.closeTo(REWARD_AMOUNT, REWARD_AMOUNT / 100n);
    });

    it("Should handle user joining mid-period", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(REWARD_DURATION / 2); // Half period

      await staking.connect(user2).stake(STAKE_AMOUNT);
      await time.increase(REWARD_DURATION / 2); // Complete period

      const earned1 = await staking.earned(user1.address);
      const earned2 = await staking.earned(user2.address);

      // User1 should have earned more (was there longer)
      expect(earned1).to.be.gt(earned2);
    });

    it("Should handle stake, withdraw, re-stake", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);

      await staking.connect(user1).withdraw(STAKE_AMOUNT);

      await time.increase(24 * 60 * 60);

      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);
    });

    it("Should handle multiple reward periods", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(REWARD_DURATION);

      const earnedFirstPeriod = await staking.earned(user1.address);

      // Start new reward period
      await staking.notifyRewardAmount(REWARD_AMOUNT);
      await time.increase(REWARD_DURATION);

      const earnedTotal = await staking.earned(user1.address);

      // Should have earned rewards from both periods
      expect(earnedTotal).to.be.gt(earnedFirstPeriod);
      expect(earnedTotal).to.be.closeTo(REWARD_AMOUNT * 2n, REWARD_AMOUNT / 50n);
    });

    it("Should handle precision with small amounts", async function () {
      const smallStake = ethers.parseEther("0.001");
      await staking.connect(user1).stake(smallStake);
      await time.increase(24 * 60 * 60);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for stake", async function () {
      const tx = await staking.connect(user1).stake(STAKE_AMOUNT);
      const receipt = await tx.wait();

      // Should be under 150k gas
      expect(receipt?.gasUsed).to.be.lt(150000);
    });

    it("Should use reasonable gas for withdraw", async function () {
      await staking.connect(user1).stake(STAKE_AMOUNT);

      const tx = await staking.connect(user1).withdraw(STAKE_AMOUNT);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(100000);
    });
  });
});
