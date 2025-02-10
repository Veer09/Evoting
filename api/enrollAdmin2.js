const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');

async function main() {
    const ccpPath = path.resolve(__dirname, 'connection2.json');
    const ccp = JSON.parse(require('fs').readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
    const ca = new FabricCAServices(caInfo.url);

    const wallet = await Wallets.newFileSystemWallet('./wallet');
    const adminExists = await wallet.get('admin2');
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
        mspId: 'Org2MSP',
        type: 'X.509',
    };

    await wallet.put('admin2', identity);
    console.log('Successfully enrolled admin and imported it into the wallet');
}

main();
