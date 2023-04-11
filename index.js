const ethers = require("ethers");
const axios = require("axios");

const chainlinkOracleAddress = "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9";
const mGLMRcontractAddress = "0x091608f4e4a15335145be0a279483c0f8e4c7955";

const chainlinkOracleABI = [
  {
    constant: true,
    inputs: [
      { internalType: "contract MToken", name: "mToken", type: "address" },
    ],
    name: "getUnderlyingPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const providerRPC = {
  moonbeam: {
    name: "moonbeam",
    rpc: "https://moonbeam.unitedbloc.com", // Insert your RPC URL here
    chainId: 1284, // 0x504 in hex,
  },
};

const provider = new ethers.JsonRpcProvider(providerRPC.moonbeam.rpc, {
  chainId: providerRPC.moonbeam.chainId,
  name: providerRPC.moonbeam.name,
});

async function getSquidLatestBlock() {
  const headers = {
    "content-type": "application/json",
  };
  const options = {
    method: "POST",
    url: "https://squid.subsquid.io/moonwell-squid/graphql",
    headers,
    data: {
      query: `query StatusQuery {
              squidStatus {
                height
              }
            }`,
    },
  };

  const response = await axios(options);
  blockNumber = response.data.data.squidStatus.height;
  console.log(`Squid latest block ${blockNumber}`);
  return blockNumber;
}

async function getLatestBlock() {
  const blockNumber = await provider.getBlockNumber();
  console.log(`Moonbeam latest block ${blockNumber}`);
  return blockNumber;
}

async function alertSquidStuck() {
  const headers = {
    "content-type": "application/json",
  };
  const options = {
    method: "POST",
    url: "https://squid-stuck.free.beeceptor.com",
    headers,
    data: {},
  };

  const response = await axios(options);
  return response.data.info === "Thank you for letting us know!";
}

async function postToMockOracle() {
  const headers = {
    "content-type": "application/json",
  };
  const options = {
    method: "POST",
    url: "https://squid.subsquid.io/moonwell-squid/graphql",
    headers,
    data: {
      query: `query latestPriceQuery {
            markets(limit: 1, orderBy: blockTimestamp_DESC) {
              underlyingPriceUSD
              address
              accrualBlockTimestamp
            }
          }`,
    },
  };

  const response = await axios(options);
  latestPrice = response.data.data.markets[0].underlyingPriceUSD;
  console.log(`Squid latest price ${latestPrice}`);

  // not actually submitting anything, but interacting with an on-chain contract to fetch something
  // using read-only function
  const chainlinkOracleContract = new ethers.Contract(
    chainlinkOracleAddress,
    chainlinkOracleABI,
    provider
  );

  const price = await chainlinkOracleContract.getUnderlyingPrice(mGLMRcontractAddress);
  console.log(`Submitted request to on-chain oracle. Latest price: ${price}`);
}


void async function() { 
    const latestBlock = await getLatestBlock();
    const squidLatestBlock = await getSquidLatestBlock();
    let res = false;
    if (latestBlock > squidLatestBlock + 10) {
      res = 1;
      console.log(
        "Warning: squid is behind Moonbeam blockchain by more than 10 blocks"
      );
      res = await alertSquidStuck();
    }
    else {
        await postToMockOracle();
    }
    process.exit(res) 
}();