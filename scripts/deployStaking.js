const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Deployment script for TokenStaking contract
 *
 * Usage:
 *   npx hardhat run scripts/deployStaking.js --network sepolia
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying TokenStaking contract with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ============================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ============================================

  // Option 1: Deploy new tokens for testing
  const DEPLOY_NEW_TOKENS = true;

  // Option 2: Use existing token addresses (update if using existing tokens)
  const EXISTING_STAKING_TOKEN = "0x0000000000000000000000000000000000000000";
  const EXISTING_REWARD_TOKEN = "0x0000000000000000000000000000000000000000";

  // Reward configuration
  const INITIAL_REWARD_AMOUNT = ethers.parseEther("10000"); // 10,000 tokens
  const REWARD_DURATION = 7 * 24 * 60 * 60; // 7 days

  let stakingTokenAddress;
  let rewardTokenAddress;

  // ============================================
  // STEP 1: Deploy or use existing tokens
  // ============================================

  if (DEPLOY_NEW_TOKENS) {
    console.log("\n📝 Deploying new test tokens...");

    const YourToken = await ethers.getContractFactory("YourToken");

    // Deploy staking token
    console.log("Deploying Staking Token...");
    const stakingToken = await YourToken.deploy(
      "Staking Token",
      "STK",
      18,
      ethers.parseEther("1000000"), // Initial supply: 1M
      ethers.parseEther("10000000"), // Cap: 10M
      deployer.address
    );
    await stakingToken.waitForDeployment();
    stakingTokenAddress = await stakingToken.getAddress();
    console.log("✅ Staking Token deployed to:", stakingTokenAddress);

    // Deploy reward token (can use same token or different)
    console.log("Deploying Reward Token...");
    const rewardToken = await YourToken.deploy(
      "Reward Token",
      "RWD",
      18,
      ethers.parseEther("1000000"),
      ethers.parseEther("10000000"),
      deployer.address
    );
    await rewardToken.waitForDeployment();
    rewardTokenAddress = await rewardToken.getAddress();
    console.log("✅ Reward Token deployed to:", rewardTokenAddress);
  } else {
    console.log("\n📝 Using existing tokens...");
    stakingTokenAddress = EXISTING_STAKING_TOKEN;
    rewardTokenAddress = EXISTING_REWARD_TOKEN;
    console.log("Staking Token:", stakingTokenAddress);
    console.log("Reward Token:", rewardTokenAddress);
  }

  // ============================================
  // STEP 2: Deploy TokenStaking contract
  // ============================================

  console.log("\n🚀 Deploying TokenStaking contract...");

  const TokenStaking = await ethers.getContractFactory("TokenStaking");
  const staking = await TokenStaking.deploy(
    stakingTokenAddress,
    rewardTokenAddress,
    deployer.address // Owner
  );

  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("✅ TokenStaking deployed to:", stakingAddress);

  // ============================================
  // STEP 3: Fund staking contract with rewards
  // ============================================

  console.log("\n💰 Funding staking contract with reward tokens...");

  const rewardToken = await ethers.getContractAt("YourToken", rewardTokenAddress);

  // Transfer reward tokens to staking contract
  const transferTx = await rewardToken.transfer(stakingAddress, INITIAL_REWARD_AMOUNT);
  await transferTx.wait();

  console.log("✅ Transferred", ethers.formatEther(INITIAL_REWARD_AMOUNT), "reward tokens to staking contract");

  // ============================================
  // STEP 4: Initialize reward distribution
  // ============================================

  console.log("\n⏰ Initializing reward distribution...");

  const notifyTx = await staking.notifyRewardAmount(INITIAL_REWARD_AMOUNT);
  await notifyTx.wait();

  const rewardRate = await staking.rewardRate();
  const periodFinish = await staking.periodFinish();

  console.log("✅ Reward distribution initialized");
  console.log("   Reward Rate:", ethers.formatEther(rewardRate), "tokens/second");
  console.log("   Period Finish:", new Date(Number(periodFinish) * 1000).toLocaleString());

  // ============================================
  // STEP 5: Verify contracts (optional)
  // ============================================

  console.log("\n🔍 Contract verification (run these commands):");
  console.log("─".repeat(80));

  if (DEPLOY_NEW_TOKENS) {
    console.log(`npx hardhat verify --network sepolia ${stakingTokenAddress} "Staking Token" "STK" 18 "${ethers.parseEther("1000000")}" "${ethers.parseEther("10000000")}" "${deployer.address}"`);
    console.log(`npx hardhat verify --network sepolia ${rewardTokenAddress} "Reward Token" "RWD" 18 "${ethers.parseEther("1000000")}" "${ethers.parseEther("10000000")}" "${deployer.address}"`);
  }

  console.log(`npx hardhat verify --network sepolia ${stakingAddress} "${stakingTokenAddress}" "${rewardTokenAddress}" "${deployer.address}"`);

  // ============================================
  // SUMMARY
  // ============================================

  console.log("\n" + "=".repeat(80));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(80));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("\nContracts:");
  console.log("  Staking Token:", stakingTokenAddress);
  console.log("  Reward Token:", rewardTokenAddress);
  console.log("  TokenStaking:", stakingAddress);
  console.log("\nConfiguration:");
  console.log("  Reward Amount:", ethers.formatEther(INITIAL_REWARD_AMOUNT), "tokens");
  console.log("  Reward Duration:", REWARD_DURATION / (24 * 60 * 60), "days");
  console.log("  Reward Rate:", ethers.formatEther(rewardRate), "tokens/second");
  console.log("=".repeat(80));

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      stakingToken: stakingTokenAddress,
      rewardToken: rewardTokenAddress,
      tokenStaking: stakingAddress,
    },
    configuration: {
      rewardAmount: ethers.formatEther(INITIAL_REWARD_AMOUNT),
      rewardDuration: REWARD_DURATION,
      rewardRate: ethers.formatEther(rewardRate),
      periodFinish: Number(periodFinish),
    },
  };

  fs.writeFileSync(
    `deployment-staking-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to: deployment-staking-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
