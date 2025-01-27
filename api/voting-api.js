const express = require('express');
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Network configuration
const ccpPath = path.resolve(__dirname, 'connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const walletPath = path.join(process.cwd(), 'wallet');
let gateway;

// Initialize Fabric connection
async function init() {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
    });
}

// Register user
app.post('/registerUser', async (req, res) => {
    const { userId, name } = req.body;
    try {
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.submitTransaction('registerUser', userId, name);
        res.status(200).json({ message: response.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add candidate
app.post('/addCandidate', async (req, res) => {
    const { candidateId, name } = req.body;

    try {
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.submitTransaction('addCandidate', candidateId, name);
        res.status(200).json({ message: response.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cast vote
app.post('/castVote', async (req, res) => {
    const { userId, candidateId } = req.body;

    try {
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.submitTransaction('castVote', userId, candidateId);
        res.status(200).json({ message: response.toString() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Query candidate
app.get('/queryCandidate/:candidateId', async (req, res) => {
    const { candidateId } = req.params;

    try {
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.evaluateTransaction('queryCandidate', candidateId);
        res.status(200).json({ data: JSON.parse(response.toString()) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
init().then(() => {
    app.listen(3000, () => {
        console.log('API server listening on port 3000');
    });
}).catch(err => {
    console.error("Failed to initialize Fabric: ${err.message}");
});