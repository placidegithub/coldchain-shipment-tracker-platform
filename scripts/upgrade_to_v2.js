const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
  const deployment = JSON.parse(fs.readFileSync("address-deployment.json", "utf8"));
  const PROXY_ADDRESS = deployment.shipmentTrackerProxy;

  const [signer] = await ethers.getSigners();
  console.log("Upgrading with wallet:", signer.address);
  console.log("Proxy address:", PROXY_ADDRESS);
  console.log("Upgrading ShipmentTracker to V2...");

  const ShipmentTrackerV2 = await ethers.getContractFactory("ShipmentTrackerV2");

  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ShipmentTrackerV2);

  console.log("Waiting for transaction confirmation...");

  if (typeof upgraded.deploymentTransaction === "function") {
    await upgraded.deploymentTransaction().wait();
  } else if (upgraded.deployTransaction) {
    await upgraded.deployTransaction.wait();
  }

  const finalAddress =
    typeof upgraded.getAddress === "function"
      ? await upgraded.getAddress()
      : upgraded.address;

  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(finalAddress);

  const updatedDeployment = {
    ...deployment,
    contractName: "ShipmentTrackerV2",
    shipmentTrackerImplementation: newImplementationAddress,
    upgradeDate: new Date().toISOString(),
  };

  fs.writeFileSync("address-deployment.json", JSON.stringify(updatedDeployment, null, 2));

  console.log("-----------------------------------------------");
  console.log("✅ ShipmentTracker successfully upgraded to V2!");
  console.log("Proxy Address:", finalAddress);
  console.log("New Implementation Address:", newImplementationAddress);
  console.log("FILE UPDATED: address-deployment.json");
  console.log("-----------------------------------------------");
}

main().catch((error) => {
  console.error("Upgrade failed:", error);
  process.exitCode = 1;
});