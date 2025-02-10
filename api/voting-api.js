const express = require("express");
const FabricCAServices = require("fabric-ca-client");
const { Wallets, Gateway } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const Voter = require("./models/voter.js");
const Candidate = require("./models/candidate.js");

const app = express();
app.use(express.json());

const ccpPath = path.resolve(__dirname, "connection.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
const ccp2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, "connection2.json"), "utf8"));

const walletPath = path.join(process.cwd(), "wallet");
let gateway;
let caClient;

const voters = [];
const candidates = [];

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
  const { voterId, name, email, phoneNumber, area, city } = req.body;
  const voter = new Voter(voterId, name, email, phoneNumber, area, city);
  voters.push(voter);
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

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
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

    const response = await contract.submitTransaction("registerUser", voterId, name);

    res.status(200).json({
      message: `User ${name} registered successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/addCandidate", async (req, res) => {
  const { candidateId, name, party, phoneNumber, area, city, email, committeeMemberId } = req.body;
  const candidate = new Candidate(candidateId, name, party, phoneNumber, area, city, email);
  candidates.push(candidate);
  try {
    if (!candidateId || !name || !committeeMemberId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const committeeIdentity = await wallet.get(committeeMemberId);

    if (!committeeIdentity) {
      return res.status(403).json({ error: `Election committee identity ${committeeMemberId} not found` });
    }

    const gateway = new Gateway();
    await gateway.connect(ccp2, {
      wallet,
      identity: committeeMemberId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const caInfo = ccp2.certificateAuthorities["ca.org2.example.com"];
    const caClient = new FabricCAServices(caInfo.url);

    const provider = wallet.getProviderRegistry().getProvider(committeeIdentity.type);
    const committeeUser = await provider.getUserContext(committeeIdentity, committeeMemberId);
    const secret = await caClient.register(
      {
        affiliation: "",
        enrollmentID: candidateId,
        role: "client",
      },
      committeeUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: candidateId,
      enrollmentSecret: secret,
    });

    const userIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: ccp2.organizations["org2"].mspid,
      type: "X.509",
    };

    await wallet.put(candidateId, userIdentity);

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.submitTransaction("addCandidate", candidateId, name);

    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/getCandidates", (req, res) => {
  const { voterId } = req.body;
  const voter = voters.find(v => v.voterId === voterId);
  const area = voter.area;
  const candidatesinArea = candidates.filter(c => c.area === area);
  return res.json(candidatesinArea);
});

app.post("/registerElectionCommittee", async (req, res) => {
  const { electionMemberId, name } = req.body;

  try {
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const caInfo = ccp2.certificateAuthorities["ca.org2.example.com"];
    const caClient = new FabricCAServices(caInfo.url);

    const memberExists = await wallet.get(electionMemberId);
    if (memberExists) {
      return res.status(400).json({ error: `Member ${electionMemberId} already exists` });
    }

    const adminIdentity = await wallet.get("admin2");
    if (!adminIdentity) {
      return res.status(403).json({ error: "Admin identity not found" });
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin2");

    const secret = await caClient.register(
      {
        enrollmentID: electionMemberId,
        role: "client",
        affiliation: "",
        attrs: [
          { name: "role", value: "electionCommittee", ecert: true },
          { name: "hf.Registrar.Roles", value: "*", ecert: true },
          { name: "hf.Registrar.Attributes", value: "*", ecert: true }
        ],
      },
      adminUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: electionMemberId,
      enrollmentSecret: secret,
    });

    const userIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: ccp2.organizations["org2"].mspid,
      type: "X.509",
    };

    await wallet.put(electionMemberId, userIdentity);

    res.status(200).json({
      message: `Election committee member ${name} registered successfully with registrar rights`,
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
      return res.status(403).json({ error: `Voter identity ${voterId} not found` });
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: voterId,
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.submitTransaction("castVote", voterId, candidateId);
    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

init().then(() => {
  app.listen(3000, () => {
    console.log("API server listening on port 3000");
  });
}).catch((err) => {
  console.error(`Failed to initialize Fabric: ${err.message}`);
});
