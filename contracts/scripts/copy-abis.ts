import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("📋 Copying ABIs to dApp...\n");

  const contractNames = ["YourToken", "TokenFactory", "SimpleSwap"];
  const artifactsPath = path.join(__dirname, "../artifacts/contracts");
  const dappAbiPath = path.join(__dirname, "../../dapp/src/abi");

  // Create dapp abi directory if it doesn't exist
  if (!fs.existsSync(dappAbiPath)) {
    console.log("📁 Creating dapp/src/abi directory...");
    fs.mkdirSync(dappAbiPath, { recursive: true });
  }

  let copiedCount = 0;

  for (const contractName of contractNames) {
    try {
      // Find the artifact file
      let artifactPath: string;

      if (contractName === "YourToken" || contractName === "TokenFactory" || contractName === "SimpleSwap") {
        artifactPath = path.join(artifactsPath, `${contractName}.sol`, `${contractName}.json`);
      } else {
        throw new Error(`Unknown contract: ${contractName}`);
      }

      if (!fs.existsSync(artifactPath)) {
        console.warn(`⚠️  Artifact not found for ${contractName} at ${artifactPath}`);
        continue;
      }

      // Read the artifact
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      // Extract ABI
      const abi = artifact.abi;

      // Create ABI file with both ABI and contract name
      const abiExport = {
        contractName: contractName,
        abi: abi,
      };

      // Write to dapp directory
      const outputPath = path.join(dappAbiPath, `${contractName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(abiExport, null, 2));

      console.log(`  ✅ Copied ${contractName} ABI`);
      copiedCount++;
    } catch (error: any) {
      console.error(`  ❌ Error copying ${contractName}:`, error.message);
    }
  }

  // Create a TypeScript index file for easy imports
  const indexContent = contractNames
    .map((name) => `export { default as ${name}Abi } from "./${name}.json";`)
    .join("\n") + "\n";

  const indexPath = path.join(dappAbiPath, "index.ts");
  fs.writeFileSync(indexPath, indexContent);
  console.log(`  ✅ Created index.ts`);

  console.log(`\n✅ Copied ${copiedCount} ABI files to ${dappAbiPath}\n`);

  if (copiedCount === 0) {
    console.error("❌ No ABIs were copied!");
    console.error("   Make sure to compile contracts first: npm run compile");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error copying ABIs:");
    console.error(error);
    process.exit(1);
  });
