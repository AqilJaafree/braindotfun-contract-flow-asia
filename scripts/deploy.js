const hre = require("hardhat");

async function main() {
  console.log("Starting deployment on Flow EVM testnet...");

  const DesciMemeFactory = await hre.ethers.getContractFactory("DesciMemeFactory");
  const factory = await DesciMemeFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("DesciMemeFactory deployed to:", factoryAddress);

  console.log("Waiting for block confirmations...");
  await factory.deploymentTransaction().wait(5);

  console.log("\nDeployment completed!");
  console.log("DesciMemeFactory:", factoryAddress);
  
  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network flowTestnet ${factoryAddress}`);
  
  console.log("\nView contract at:");
  console.log(`https://evm-testnet.flowscan.io/address/${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });