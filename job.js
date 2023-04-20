const getSquidLatestBlock = () => {
    return new Promise((resolve, reject) =>{
      httpPOST(
          "https://squid.subsquid.io/moonwell-squid/graphql",
          JSON.stringify({
          query: `query StatusQuery {
                  squidStatus {
                      height
                  }
                  }`,
          }),
          {
          "content-type": "application/json",
          },
          (response, certificate) => {
              console.debug("response", response);
              let squidBlockNumber = Number(JSON.parse(response).data.squidStatus.height);
              console.log(`Squid latest block ${squidBlockNumber}`);
              resolve(squidBlockNumber);
          },
          (errorMessage) => {
              reject(errorMessage);
              console.error(errorMessage)
          }
      )
    })
  };

  const getLatestBlock = () => {
    return new Promise((resolve, reject) =>{

      const RPC = "https://rpc.api.moonbeam.network";

      const eth_blockNumberQuery = {
          "method":"eth_blockNumber",
          "params":[],
          "id":1,
          "jsonrpc":"2.0"
      };

      httpPOST(
          RPC,
          JSON.stringify(eth_blockNumberQuery),
          {
              "content-type": "application/json"
          },
          (response, certificate) => {
              console.debug("response", response);
              const blockNumber = Number(JSON.parse(response).result);
              console.log(`Moonbeam latest block ${blockNumber}`);
              resolve(blockNumber);
          },
          (errorMessage) => {
              console.error('Failed: ' + errorMessage);
              reject(errorMessage);
          }
      )
    })
  };

  const alertSquidStuck = () => {

      return new Promise((resolve, reject) => {
          httpPOST(
              "https://squid-stuck.free.beeceptor.com",
              "", // expects a JSON string as POST body
              {
                  "content-type": "application/json"
              },
              (response, certificate) => {
                  console.debug("response", response);
                  const info = String(JSON.parse(response).info);
                  console.debug(`${info}`);
                  resolve(info === "Thank you for letting us know!");
              },
              (errorMessage) => {
                  console.error('Failed: ' + errorMessage);
                  reject(errorMessage);
              }
          )
      })
  }

  const getMoonwelData = () => {
    return new Promise((resolve, reject) =>{
      httpPOST(
          "https://squid.subsquid.io/moonwell-squid/graphql",
          JSON.stringify({
          query: `query latestDataQuery {
              markets(limit: 1, orderBy: blockTimestamp_DESC) {
                underlyingPriceUSD
                address
                reserves
                supplyRate
                reserveFactor
                accrualBlockTimestamp
              }
            }`,
          }),
          {
          "content-type": "application/json",
          },
          (response, certificate) => {
              console.debug("response", response);
              let squidData = JSON.parse(response).data.markets[0];
              console.log(`Squid latest price ${squidData.underlyingPriceUSD}`);
              resolve(squidData);
          },
          (errorMessage) => {
              reject(errorMessage);
              console.error(errorMessage)
          }
      )
    })
  };

  const postReservesData = (moonwellSquidData) => {
      const oracleAddress = "0x97AccdDd30259Ee97673943c9b2c1A9dF6922635";//"<0x evm_contract_address>";
      const reserves = moonwellSquidData.reserves.toString(16)
      // Fulfill reserves
      _STD_.chains.ethereum.fulfill(
          "https://evm.shibuya.astar.network",  // RPC
          oracleAddress,                        // Destination contract address
          reserves,                            // Payload
          // Transaction parameters
          {
              methodSignature: "set_reserves(bytes)",
              gasLimit: "9000000",
              maxFeePerGas: "255000000000",
              maxPriorityFeePerGas: "2550000000",
          },
          // Success callback
          (opHash) => {
              console.log("Succeeded: " + opHash)
          },
          // Error callback
          (err) => {
              console.error("Failed: " + err)
          },
      );
  }

  const postPriceData = (moonwellSquidData) => {
      const oracleAddress = "0x97AccdDd30259Ee97673943c9b2c1A9dF6922635";//"<0x evm_contract_address>";
      const price = moonwellSquidData.underlyingPriceUSD * 1000000000000000000n
      // Fulfill price
      _STD_.chains.ethereum.fulfill(
          "https://evm.shibuya.astar.network",  // RPC
          oracleAddress,                        // Destination contract address
          price,                            // Payload
          // Transaction parameters
          {
              methodSignature: "set_price(uint256)",
              gasLimit: "9000000",
              maxFeePerGas: "255000000000",
              maxPriorityFeePerGas: "2550000000",
          },
          // Success callback
          (opHash) => {
              console.log("Succeeded: " + opHash)
          },
          // Error callback
          (err) => {
              console.error("Failed: " + err)
          },
      );
  }

  void async function() {
      const latestBlock = await getLatestBlock();
      const squidLatestBlock = await getSquidLatestBlock();
      if (latestBlock > (squidLatestBlock + 5)) {
        console.warn(
          "Warning: squid is behind Moonbeam blockchain by more than 10 blocks"
        );
        await alertSquidStuck();
        return;
      }
      const squidData = await getMoonwelData();
      await postToAstarOracle(squidData);
  }();
