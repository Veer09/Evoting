require("dotenv").config();
const express = require("express");
const FabricCAServices = require("fabric-ca-client");
const { Wallets, Gateway } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const Voter = require("./models/voter.js");
const Candidate = require("./models/candidate.js");
const mongoose = require("./database");
const { generateToken, verifyToken } = require("./token.js");
const cookieParser = require("cookie-parser");
const CommitteeMember = require("./models/committeeMember.js");
const otpService = require('./otpService');
const cors = require('cors');
const Election = require('./models/election.js');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],         
  credentials: true                 
}));

app.use(cookieParser());
app.use(express.json());

const ccpPath = path.resolve(__dirname, "connection.json");
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
const ccp2 = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "connection2.json"), "utf8")
);

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

app.get("/verifyToken", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    console.log(payload);

    let userType = null;
    let userId = null;
    
    if (payload.voterId) {
      userType = "voter";
      userId = payload.voterId;
    } else if (payload.committeeMemberId) {
      userType = "electionCommittee";
      userId = payload.committeeMemberId;
    }
    
    if (!userType) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.status(200).json({ 
      user: {
        id: userId,
        role: userType
      }
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/loginUser", async (req, res) => {
  const { voterId , otp} = req.body;
  try {
    console.log(voterId);
    const otpVerification = otpService.verifyOTP(voterId, otp);
    if (!otpVerification.valid) {
      return res.status(401).json({ error: otpVerification.message });
    }

    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }
    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const voterExists = await wallet.get(voterId);

    if (voterExists) {
      const token = generateToken({ voterId});
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });
      return res.status(200).json({
        message: `User logged in successfully`,
      });
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
      voterId
    );
    console.log(response);
    const token = generateToken({ voterId});
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });
    res.status(200).json({
      message: `User logged in successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/addCandidate", async (req, res) => {
  const { name, party, phoneNumber, area, city, email, state, country, description , electionId} =
    req.body;
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    const committeeMemberId = payload.committeeMemberId;
    const comMember = await CommitteeMember.find({ committeeMemberId });
    if (!comMember) {
      return res
        .status(403)
        .json({ error: "Election committee member not found" });
    }

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const committeeIdentity = await wallet.get(committeeMemberId);

    if (!committeeIdentity) {
      return res
        .status(403)
        .json({
          error: `Election committee identity ${committeeMemberId} not found`,
        });
    }

    const gateway = new Gateway();
    await gateway.connect(ccp2, {
      wallet,
      identity: committeeMemberId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const caInfo = ccp2.certificateAuthorities["ca.org2.example.com"];
    const caClient = new FabricCAServices(caInfo.url);

    const provider = wallet
      .getProviderRegistry()
      .getProvider(committeeIdentity.type);
    const committeeUser = await provider.getUserContext(
      committeeIdentity,
      committeeMemberId
    );
    const upParty = party.toUpperCase();
    const upArea = area.toUpperCase();

    const newCandidate = await Candidate.create({
      name,
      party : upParty,
      phoneNumber,
      area : upArea,
      city,
      email,
      state,
      country,
      description,
      electionId,
    });
    const candidateId = newCandidate._id;

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

    const response = await contract.submitTransaction(
      "addCandidate",
      candidateId,
      electionId,
    );

    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/getCandidates", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    const voterId = payload.voterId;
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(403).json({ error: "Voter not found" });
    }
    const area = voter.area;
    const candidates = await Candidate.find({ area },"name party");
    res.status(200).json({ candidates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auditElection/:id", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    const committeeMemberId = payload.committeeMemberId;
    const comMember = await CommitteeMember.findOne({ committeeMemberId });
    if (!comMember) {
      return res
        .status(403)
        .json({ error: "Election committee member not found" });
    }

    const electionId = req.params.id;
    const election = await Election.findOne({ _id: electionId });
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }
    if(election.endDate < Date.now()){
      return res.status(403).json({ error: "Election has not ended yet" });
    }

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const committeeIdentity = await wallet.get(committeeMemberId);

    if (!committeeIdentity) {
      return res
        .status(403)
        .json({
          error: `Election committee identity ${committeeMemberId} not found`,
        });
    }

    const gateway = new Gateway();
    await gateway.connect(ccp2, {
      wallet,
      identity: committeeMemberId,
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");
    const contract = network.getContract("voting");

    const response = await contract.submitTransaction("auditElection");

    res.status(200).json({ message: response.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/loginElectionCommittee", async (req, res) => {
  const { committeeMemberId, otp } = req.body;

  try {
    const otpVerification = otpService.verifyOTP(committeeMemberId, otp);
    if (!otpVerification.valid) {
      return res.status(401).json({ error: otpVerification.message });
    }

    const committeeMember = await CommitteeMember.findOne({ committeeMemberId: committeeMemberId });
    if (!committeeMember) {
      return res.status(404).json({ error: "Election committee member not found" });
    }

    const walletPath = path.join(__dirname, "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const memberExists = await wallet.get(committeeMemberId);
    if (memberExists) {
      const token = generateToken({ committeeMemberId });
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
      });
      return res.status(200).json({ error: `Logged in Successfully` });
    }

    const adminIdentity = await wallet.get("admin2");
    if (!adminIdentity) {
      return res.status(403).json({ error: "Admin identity not found" });
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin2");

    const caInfo = ccp2.certificateAuthorities["ca.org2.example.com"];
    const caClient = new FabricCAServices(caInfo.url);

    const secret = await caClient.register(
      {
        enrollmentID: committeeMemberId,
        role: "client",
        affiliation: "",
        attrs: [
          { name: "role", value: "electionCommittee", ecert: true },
          { name: "hf.Registrar.Roles", value: "*", ecert: true },
          { name: "hf.Registrar.Attributes", value: "*", ecert: true },
        ],
      },
      adminUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: committeeMemberId,
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

    await wallet.put(committeeMemberId, userIdentity);
    const token = generateToken({ committeeMemberId });

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.status(200).json({ message: `Election committee member logged in successfully with OTP verification` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/requestOTP", async (req, res) => {
  console.log('here');
  const { voterId } = req.body;
  
  try {
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    const otp = otpService.generateOTP();
    otpService.storeOTP(voterId, otp);
   
    let emailResult = { success: false };
    
    if (voter.email) {
      emailResult = await otpService.sendOTPByEmail(voter.email, otp);
    }

    if (emailResult.success) {
      return res.status(200).json({
        message: "OTP sent successfully",
        sentToEmail: emailResult.success,
      });
    } else {
      return res.status(500).json({
        error: "Failed to send OTP",
        emailError: emailResult.error,
      });
    }
  } catch (err) {
    console.error("Error in requestOTP:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/requestCommitteeOTP", async (req, res) => {
  console.log('here');
  const { committeeMemberId } = req.body;
  try {
    const committeeMember = await CommitteeMember.findOne({ committeeMemberId});
    if (!committeeMember) {
      return res.status(404).json({ error: "Committee member not found" });
    }

    const otp = otpService.generateOTP();
    otpService.storeOTP(committeeMemberId, otp);

    let emailResult = { success: false };

    if (committeeMember.email) {
      emailResult = await otpService.sendOTPByEmail(committeeMember.email, otp);
    }

    if (emailResult.success) {
      return res.status(200).json({
        message: "OTP sent successfully",
        sentToEmail: emailResult.success,
      });
    } else {
      return res.status(500).json({
        error: "Failed to send OTP",
        emailError: emailResult.error,
      });
    }
  } catch (err) {
    console.error("Error in requestCommitteeOTP:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: false, 
      sameSite: "Strict" 
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/currentElection", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    const voterId = payload.voterId;
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(403).json({ error: "Voter not found" });
    }
    const area = voter.area;
    const election = await Election.findOne({ status: "active" });
    if (!election) {
      return res.status(404).json({ error: "No active election found" });
    }

    const candidateCount = await Candidate.countDocuments({});

    res.status(200).json({ 
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: election.status,
        candidateCount: candidateCount,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/elections", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);

    if (!payload.committeeMemberId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const elections = await Election.find({});
    res.status(200).json({ elections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/elections", async (req, res) => {
  try {
    const { title, description, startDate, endDate} = req.body;
    
    const token = req.cookies.token;
    const payload = verifyToken(token);

    if (!payload.committeeMemberId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const election = new Election({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending'
    });
    
    await election.save();
    
    res.status(201).json({ 
      message: "Election created successfully", 
      election 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/checkStatus", async (req, res) => {
  try {
    const elections = await Election.find({ status: 'active' || 'pending' });
    elections.map(async (election) => {
      if (election.startDate <= Date.now()) {
        election.status = 'active';
        await election.save();
      }
      if (election.endDate < Date.now()) {
        election.status = 'completed';
        await election.save();
      }
    }
    );
    return res.status(200).json({ message: "Status updated successfully" });
  }
  catch(e){
    console.log("Error in fetching data");
    return res.status(500).json({ error: "Error in fetching data" });
  }
});
app.put("/elections/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const token = req.cookies.token;
    const payload = verifyToken(token);
    
    if (!payload.committeeMemberId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const isActive = await Election.exists({ status: 'active' });
    if (status === 'active' && isActive) {
      return res.status(400).json({ error: "Another election is already active" });
    }
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    election.status = status;
    await election.save();
    
    res.status(200).json({ 
      message: "Election status updated successfully", 
      election 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/activeElections", async (req, res) => {
  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    
    if (!payload.voterId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const voter = await Voter.findOne({ voterId: payload.voterId });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    const elections = await Election.find({ 
      status: 'active',
      area: voter.area
    });

    const electionData = await Promise.all(elections.map(async (election) => {
      const candidateCount = await Candidate.countDocuments({ area: election.area });
      
      return {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        area: election.area,
        candidateCount
      };
    }));
    
    res.status(200).json({ elections: electionData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/elections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;
    console.log(token);
    const payload = verifyToken(token);
    
    if (!payload.voterId && !payload.committeeMemberId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }
    const voter = await Voter.findOne({ voterId: payload.voterId });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }
    const area = voter.area;

    const candidates = await Candidate.find({ area });
    
    res.status(200).json({ 
      election: {
        id: election._id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        status: election.status,
        area: election.area,
      },
      candidates: candidates.map(c => ({
        id: c._id,
        name: c.name,
        party: c.party,
        description: c.description
      }))
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;
    const payload = verifyToken(token);
    
    if (!payload.voterId && !payload.committeeMemberId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    
    res.status(200).json({ 
      candidate: {
        id: candidate._id,
        name: candidate.name,
        party: candidate.party,
        description: candidate.description
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/castVote", async (req, res) => {
  const { candidateId, electionId } = req.body;

  try {
    const token = req.cookies.token;
    const payload = verifyToken(token);
    const voterId = payload.voterId;
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(403).json({ error: "Voter not found" });
    }
    const candidate = await Candidate.findOne({ _id : candidateId });
    if (!candidate) {
      return res.status(403).json({ error: "Candidate not found" });
    }
    const election = await Election.findOne({ _id : electionId });
    if (!election) {
      return res.status(403).json({ error: "Election not found" });
    }
    if(election.status !== 'active'){
      return res.status(403).json({ error: "Election is not active" });
    }
    const varea = voter.area;
    const carea = candidate.area;
    if (varea !== carea) {
      return res
        .status(403)
        .json({ error: "Voter and candidate are not in the same area" });
    }

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
    console.log('before');
    const userId = parseInt(voterId);
    const response = await contract.submitTransaction(
      "castVote",
      userId,
      candidateId,
      electionId
    );
    console.log('after');
    res.status(200).json({ message: response.toString() });
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
