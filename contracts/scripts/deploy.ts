import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📋 Deployment Info:");
  console.log("  Network:", network.name, `(chainId: ${network.chainId})`);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy TokenFactory
  console.log("📦 Deploying TokenFactory...");
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const factory = await TokenFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("  ✅ TokenFactory deployed to:", factoryAddress);

  // Deploy SimpleSwap
  console.log("\n📦 Deploying SimpleSwap...");
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const swap = await SimpleSwap.deploy(deployer.address);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("  ✅ SimpleSwap deployed to:", swapAddress);

  // Prepare deployment data
  const deploymentData = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TokenFactory: {
        address: factoryAddress,
      },
      SimpleSwap: {
        address: swapAddress,
        owner: deployer.address,
      },
    },
  };

  // Save deployment info
  const docsPath = path.join(__dirname, "../../docs");
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }

  const deploymentsFilePath = path.join(docsPath, "deployments.json");
  let allDeployments: any = {};

  // Load existing deployments if file exists
  if (fs.existsSync(deploymentsFilePath)) {
    const existingData = fs.readFileSync(deploymentsFilePath, "utf8");
    allDeployments = JSON.parse(existingData);
  }

  // Add new deployment
  const networkKey = `${network.name}-${network.chainId}`;
  allDeployments[networkKey] = deploymentData;

  fs.writeFileSync(deploymentsFilePath, JSON.stringify(allDeployments, null, 2));

  console.log("\n📝 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`Network:        ${network.name} (${network.chainId})`);
  console.log(`TokenFactory:   ${factoryAddress}`);
  console.log(`SimpleSwap:     ${swapAddress}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log("=".repeat(60));

  console.log("\n💾 Deployment data saved to:", deploymentsFilePath);

  console.log("\n📋 Next Steps:");
  console.log("  1. Run 'npm run copy-abis' to copy ABIs to the dapp");
  console.log("  2. Update dapp/.env with contract addresses:");
  console.log(`     VITE_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`     VITE_SWAP_ADDRESS=${swapAddress}`);
  console.log("  3. Update subgraph/subgraph.yaml with contract addresses");

  if (network.chainId === 11155111n || network.chainId === 5n) {
    console.log(`  4. Verify contracts on Etherscan:`);
    console.log(`     npm run verify:${network.name}`);
  }

  console.log("\n✅ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
