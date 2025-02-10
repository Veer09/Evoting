const express = require("express");
const FabricCAServices = require("fabric-ca-client");
const { Wallets, Gateway } = require("fabric-network");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const ccpPath = path.resolve(__dirname, "connection.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
const ccp2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, "connection2.json"), "utf8"));

const walletPath = path.join(process.cwd(), "wallet");
let gateway;
let caClient;

async function init() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "admin",
    discovery: { enabled: true, asLocalhost: true },
  });
  const caURL = ccp.certificateAuthorities["ca.org1.example.com"].url;
  caClient = new FabricCAServices(caURL);
}

app.post("/registerUser", async (req, res) => {

  const { voterId, firstName, lastName } = req.body;
  try {
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const voterExists = await wallet.get(voterId);
    if (voterExists) {
      return res.status(400).json({ error: `Voter ${voterId} already exists` });
    }

    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      return res.status(403).json({ error: "Admin identity not found" });
    }

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    const secret = await caClient.register(
      {
        affiliation: "",
        enrollmentID: voterId,
        role: "client",
      },
      adminUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: voterId,
      enrollmentSecret: secret,
    });

    const userIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: ccp.organizations["Org1"].mspid,
      type: "X.509",
    };

    await wallet.put(voterId, userIdentity);

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.submitTransaction(
      "registerUser",
      voterId,
      firstName
    );

    res.status(200).json({
      message: `User ${firstName} ${lastName} registered successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/addCandidate", async (req, res) => {
  const { candidateId, name, committeeMemberId } = req.body;

  try {
    // Validate input
    if (!candidateId || !name || !committeeMemberId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const committeeIdentity = await wallet.get(committeeMemberId);

    // Check if the election committee member identity exists
    if (!committeeIdentity) {
      return res.status(403).json({ error: `Election committee identity ${committeeMemberId} not found` });
    }

    // Connect as the election committee member
    const gateway = new Gateway();
    await gateway.connect(ccp2, {
      wallet,
      identity: committeeMemberId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    console.log('pappu');
    const contract = network.getContract("voting");

    // Submit the transaction to add a candidate
    const response = await contract.submitTransaction("addCandidate", candidateId, name);
    
    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  app.post("/registerElectionCommittee", async (req, res) => {
    const { electionMemberId, name } = req.body;

    try {
        const walletPath = path.join(__dirname, "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const caInfo = ccp2.certificateAuthorities["ca.org2.example.com"];
        const caClient = new FabricCAServices(caInfo.url);
        // Check if the election committee member already exists
        const memberExists = await wallet.get(electionMemberId);
        if (memberExists) {
            return res.status(400).json({ error: `Member ${electionMemberId} already exists` });
        }

        // Get the admin identity
        const adminIdentity = await wallet.get("admin2");
        if (!adminIdentity) {
            return res.status(403).json({ error: "Admin identity not found" });
        }

        // Get the admin user context
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, "admin2");

        // Register the election committee member with the CA
        const secret = await caClient.register(
            {
                enrollmentID: electionMemberId,
                role: "client",
                attrs: [{ name: "role", value: "electionCommittee", ecert: true }],
                affiliation: "",
            },
            adminUser
        );

        // Enroll the election committee member
        const enrollment = await caClient.enroll({
            enrollmentID: electionMemberId,
            enrollmentSecret: secret,
        });

        // Create an identity for the election committee member
        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: ccp2.organizations["org2"].mspid,
            type: "X.509",
        };

        // Store the member identity in the wallet
        await wallet.put(electionMemberId, userIdentity);

        res.status(200).json({
            message: `Election committee member ${name} registered successfully`,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });


app.post("/castVote", async (req, res) => {
  const { voterId, candidateId } = req.body;

  try {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const voterIdentity = await wallet.get(voterId);
    if (!voterIdentity) {
      return res
        .status(403)
        .json({ error: `Voter identity ${voterId} not found` });
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: voterId,
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.submitTransaction(
      "castVote",
      voterId,
      candidateId
    );
    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/queryCandidate/:candidateId", async (req, res) => {
  const { candidateId } = req.params;

  try {
    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.evaluateTransaction(
      "queryCandidate",
      candidateId
    );
    res.status(200).json({ data: JSON.parse(response.toString()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

init()
  .then(() => {
    app.listen(3000, () => {
      console.log("API server listening on port 3000");
    });
  })
  .catch((err) => {
    console.error(`Failed to initialize Fabric: ${err.message}`);
  });
