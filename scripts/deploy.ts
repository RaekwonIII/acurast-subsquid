import { ethers } from "hardhat";

async function main() {
  const processorAddress =  "0xPROCESSOR_ADDRESS";

  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy(processorAddress);

  await oracle.deployed();

  console.log(
    `Oracle bound to processor: ${processorAddress} deployed to ${oracle.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
