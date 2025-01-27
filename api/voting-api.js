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
let caClient;

// Initialize Fabric connection
async function init() {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
    });
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    caClient = new FabricCAServices(caURL);
}


app.post('/registerUser', async (req, res) => {
    const { voterId, firstName, lastName } = req.body;
    try {
        // Load the wallet
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if the voter already exists
        const voterExists = await wallet.get(voterId);
        if (voterExists) {
            return res.status(400).json({ error: `Voter ${voterId} already exists` });
        }

        // Check if the admin identity exists
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            return res.status(403).json({ error: 'Admin identity not found' });
        }

        // Get the admin user context
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the new voter
        const secret = await caClient.register(
            {
                affiliation: '',
                enrollmentID: voterId,
                role: 'client'
            },
            adminUser
        );

        // Enroll the new voter
        const enrollment = await caClient.enroll({
            enrollmentID: voterId,
            enrollmentSecret: secret
        });

        // Create a new identity for the voter
        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
            },
            mspId: ccp.organizations['Org1'].mspid,
            type: 'X.509'
        };

        // Add the new identity to the wallet
        await wallet.put(voterId, userIdentity);

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.submitTransaction('registerUser', voterId, firstName);

        res.status(200).json({ message: `User ${firstName} ${lastName} registered successfully` });
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
    const { voterId, candidateId } = req.body;

    try {
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const voterIdentity = await wallet.get(voterId);
            if (!voterIdentity) {
                return res.status(403).json({ error: 'Voter identity ${voterId} not found' });
            }
        
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: voterId,
            discovery: { enabled: true, asLocalhost: true }
        });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        const response = await contract.submitTransaction('castVote', voterId, candidateId);
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
    console.error(`Failed to initialize Fabric: ${err.message}`);
});