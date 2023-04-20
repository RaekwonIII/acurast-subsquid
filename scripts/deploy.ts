import { ethers } from "hardhat";

async function main() {
  const processorAddress =  "Y32hsa4AbRMMEZ99skj5MTMvXE7mnZLqKPZF1un1VLoBLsn";

  const Oracle = await ethers.getContractFactory("MoonwellInfoOracle");
  const oracle = await Oracle.deploy();
  // const oracle = await Oracle.deploy(processorAddress);

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
