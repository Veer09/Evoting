const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');

async function main() {
    const ccpPath = path.resolve(__dirname, 'connection.json');
    const ccp = JSON.parse(require('fs').readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const ca = new FabricCAServices(caInfo.url);

    const wallet = await Wallets.newFileSystemWallet('./wallet');
    const adminExists = await wallet.get('admin');
    if (adminExists) {
        console.log('Admin identity already exists in the wallet');
        return;
    }

    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    const identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    await wallet.put('admin', identity);
    console.log('Successfully enrolled admin and imported it into the wallet');
}

main();
