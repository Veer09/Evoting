const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function main() {
  try {
    // Load the connection profile; adjust the path if needed
    const ccpPath = path.resolve(__dirname, "connection.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Set up the wallet to hold the credentials of exploreradmin
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled exploreradmin
    const identity = await wallet.get("admin");
    if (!identity) {
      console.log("Exploreradmin identity not found in wallet");
      return;
    }

    // Create a new gateway for connecting to the peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true }, // use appropriate options for your network
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // You can now interact with the channel, for example get the contract:
    // const contract = network.getContract('chaincodeName');

    console.log("Successfully accessed the channel using exploreradmin");
    await gateway.disconnect();
  } catch (error) {
    console.error(`Error accessing channel: ${error}`);
  }
}

main();
