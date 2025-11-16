import { run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 Starting contract verification...\n");

  // Load deployment data
  const deploymentsFilePath = path.join(__dirname, "../../docs/deployments.json");

  if (!fs.existsSync(deploymentsFilePath)) {
    console.error("❌ deployments.json not found!");
    console.error("   Please run 'npm run deploy' first.");
    process.exit(1);
  }

  const allDeployments = JSON.parse(fs.readFileSync(deploymentsFilePath, "utf8"));
  const chainId = (await network.provider.send("eth_chainId", []));
  const networkName = network.name;
  const networkKey = `${networkName}-${parseInt(chainId)}`;

  if (!allDeployments[networkKey]) {
    console.error(`❌ No deployment found for network: ${networkName} (${chainId})`);
    console.error("   Available deployments:", Object.keys(allDeployments).join(", "));
    process.exit(1);
  }

  const deployment = allDeployments[networkKey];
  const { TokenFactory, SimpleSwap } = deployment.contracts;

  console.log("📋 Verification Info:");
  console.log("  Network:", networkName, `(chainId: ${parseInt(chainId)})`);
  console.log("  TokenFactory:", TokenFactory.address);
  console.log("  SimpleSwap:", SimpleSwap.address);
  console.log();

  try {
    // Verify TokenFactory
    console.log("🔍 Verifying TokenFactory...");
    try {
      await run("verify:verify", {
        address: TokenFactory.address,
        constructorArguments: [],
      });
      console.log("  ✅ TokenFactory verified!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("  ℹ️  TokenFactory already verified");
      } else {
        throw error;
      }
    }

    // Verify SimpleSwap
    console.log("\n🔍 Verifying SimpleSwap...");
    try {
      await run("verify:verify", {
        address: SimpleSwap.address,
        constructorArguments: [SimpleSwap.owner],
      });
      console.log("  ✅ SimpleSwap verified!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("  ℹ️  SimpleSwap already verified");
      } else {
        throw error;
      }
    }

    console.log("\n✅ Verification complete!\n");
  } catch (error) {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
